/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
    constructor(stories) {
        this.stories = stories;
    }

    /** Generate a new StoryList. It:
     *
     *  - calls the API
     *  - builds an array of Story instances
     *  - makes a single StoryList instance out of that
     *  - returns the StoryList instance.
     */

    static async getStories() {
      // Note presence of `static` keyword: this indicates that getStories is
      //  **not** an instance method. Rather, it is a method that is called on the
      //  class directly. Why doesn't it make sense for getStories to be an
      //  instance method?

      // query the /stories endpoint (no auth required)
        const response = await axios({
        url: `${BASE_URL}/stories`,
        method: "GET",    
    }, {params: {limit: 30}});

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
        return new StoryList(stories);
    }

    /** Adds story data to API, makes a Story instance, adds it to story list.
     * - user - the current instance of User who will post the story
     * - obj of {title, author, url}
     *
     * Returns the new Story instance
     */

    async addStory(user, {title, author, url}) 
    {
        // Get the current user's token. 
        const token = user.loginToken;
    
        // Get a response from API via post method. 
        const response = await axios({
            method: 'POST',
            url: `${BASE_URL}/stories`,
            data: {token, story: {title, author, url}}
        });

        // Create a new story and push it into stories to the beginning using unshift().
        const newStory = new Story(response.data.story);
        this.stories.unshift(newStory);
        // Add it to users' own stories.
        user.ownStories.unshift(newStory);

        return newStory;
    }

  
    /** Delete story from story list and API. */
    async deleteStory(user, storyID) 
    {
        const token = user.loginToken;
        await axios({
          url: `${BASE_URL}/stories/${storyID}`,
          method: "DELETE",
          data: { token: user.loginToken }
        });

      // Use the filter function to filter out the designated stories in general stories,
      // users' stories, and favorite stories.  
      this.stories = this.stories.filter(s => s.storyId !== storyID);
      user.ownStories = user.ownStories.filter(s => s.storyId !== storyID);
      user.favorites = user.favorites.filter(s => s.storyId !== storyID);
  }
}

