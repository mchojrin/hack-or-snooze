"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
    storyList = await StoryList.getStories();
    $storiesLoadingMsg.remove();

    putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) 
{
    // console.debug("generateStoryMarkup", story);
    const hostName = story.getHostName();

    // if user is logged in, show fav/non fav stars. 
    const showStar = Boolean(currentUser);

    // Generate the story on the DOM. 
    return $(`
        <li id="${story.storyId}">
            ${showDeleteBtn ? getDeleteBtnHTML() : ""}
            ${showStar ? getStarHTML(story, currentUser) : ""}
            <a href="${story.url}" target="a_blank" class="story-link">
                ${story.title}
            </a>
            <small class="story-hostname">(${hostName})</small>
            <small class="story-author">by ${story.author}</small>
            <small class="story-user">posted by ${story.username}</small>
        </li>
    `);
}

/** Add Delete Button to the DOM for every story. */
function getDeleteBtnHTML(){
    return `
            <span class="trash-can">
                <i class="fas fa-trash-alt"></i>
            </span>
            `;
}

/*
    A method to add a favorite star, or not favorite to the HTML.
*/
function getStarHTML(story, user){
    const isFavorite = user.isFavorite(story);
    const starType = isFavorite ? "fas" : "far";
    
    return `
        <span class="star">
            <i class="${starType} fa-star"></li>
        </span>`;
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
    console.debug("putStoriesOnPage");

    $allStoriesList.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
        const $story = generateStoryMarkup(story);
        $allStoriesList.append($story);
    }

    $allStoriesList.show();
}

// Handle submitting the new story.
async function submitNewStory(e){
    console.debug('submitNewStory');
    e.preventDefault();

    // Get the user's form data.
    const title = $('#create-title').val();
    const url = $('#create-url').val();
    const author = $('#create-author').val();
    const username = currentUser.username;
    const storyData = {title, url, author, username};

    // Create a new story with the data. 
    const story = await storyList.addStory(currentUser, storyData);

    // Add the story to the DOM. 
    const $story = generateStoryMarkup(story);
    $allStoriesList.prepend($story);

    // Reset back to default. 
    $submitForm.slideUp("slow");
    $submitForm.trigger("reset");
}

$submitForm.on('submit', submitNewStory);

/** A method to add the user's own list of stories */
function addUserOwnStoryList(){
    $myStories.empty();

    if (currentUser.ownStories.length === 0){
        $myStories.append("<h5>Current User has no stories added yet.</h5>");
    } else{
    // traverse through user's list and add to the DOM.
    for (let story of currentUser.ownStories){
        let $story = generateStoryMarkup(story, true);
        $myStories.append($story);
    }
    }
    $myStories.show();
}

/** Put the users' favorites on the page. */
function addUserFavoritesList(){
    $favoritedStories.empty();

    if (currentUser.favorites.length === 0){
        $favoritedStories.append("<h5>User has no favorites added yet.</h5>");
    } 
    else{
        // traverse through the users' favorites and add to the DOM.
        for(let story of currentUser.favorites){
            const $story = generateStoryMarkup(story);
            $favoritedStories.append($story);
        }
    }
    $favoritedStories.show();
}

/** Handle the event to favorite/un-favorite a story */
async function toggleFavoriteStory(e){
    const $target = $(e.target);
    const $closestLi = $target.closest('li');
    const storyId = $closestLi.attr('id');
    const story = storyList.stories.find(s => s.storyId === storyId);

    // Check if the story is already favorited by checking the presence of star.
    if ($target.hasClass("fas")){
        // it's a favorite!
        await currentUser.removeFavorite(story);
        $target.closest('i').toggleClass('fas far'); 
    } 
    else{
        // not a favorite!
        await currentUser.addFavorites(story);
        $target.closest('i').toggleClass('fas far');
    }
}


/** Handle the event to delete the story when user clicks trash can. */
async function deleteHelper(e) {
    console.debug("deleteStory");

    // Find the ancestor html element of the story.
    const $closestLi = $(e.target).closest("li");
    // Get the id of that story. 
    const storyId = $closestLi.attr("id");
    // Remove that story from the API. 
    await storyList.deleteStory(currentUser, storyId);

    // re-generate story list
    await addUserOwnStoryList();
}

$myStories.on("click", ".trash-can", deleteHelper);
$storiesLists.on('click', '.star', toggleFavoriteStory);

