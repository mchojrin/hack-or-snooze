/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
    /** Make user instance from obj of user data and a token:
     *   - {username, name, createdAt, favorites[], ownStories[]}
     *   - token
     */

    constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
                },
                token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
    }

    /** Register new user in API, make User instance & return it.
     *
     * - username: a new username
     * - password: a new password
     * - name: the user's full name
    */

    static async signup(username, password, name) 
    {
        try{ 
            const response = await axios({
                url: `${BASE_URL}/signup`,
                method: "POST",
                data: { user: { username, password, name } },
            });

            return new User(
            {
                username: user.username,
                name: user.name,
                createdAt: user.createdAt,
                favorites: user.favorites,
                ownStories: user.stories
            },
            response.data.token
            );
        } catch(e)
        {
            let code = e.response.status;
            if(code === 409){
                alert('User has already been registered.');
            }
        }
    }

    /** Login in user with API, make User instance & return it.

     * - username: an existing user's username
     * - password: an existing user's password
     */

    static async login(username, password) 
    {
    try{ 
        const response = await axios({
            url: `${BASE_URL}/login`,
            method: "POST",
            data: { user: { username, password } },
        });

        let { user } = response.data;

        return new User(
        {
            username: user.username,
            name: user.name,
            createdAt: user.createdAt,
            favorites: user.favorites,
            ownStories: user.stories
        },
        response.data.token
        );
        } catch(e)
        {
            let code = e.response.status;
            if(code === 401){
                alert('Users credentials invalid.');
            }
        }
    }

    /** When we already have credentials (token & username) for a user,
     *   we can log them in automatically. This function does that.
     */

    static async loginViaStoredCredentials(token, username) {
    try {
        const response = await axios({
            url: `${BASE_URL}/users/${username}`,
            method: "GET",
            params: { token },
        });

        let { user } = response.data;

        return new User(
        {
            username: user.username,
            name: user.name,
            createdAt: user.createdAt,
            favorites: user.favorites,
            ownStories: user.stories
        },
            token
        );
        } catch (err) {
        console.error("loginViaStoredCredentials failed", err);
        return null;
    }
    }

    /** Add to the user's list of favorite stories and update API
    */
    async addFavorites(story){
        this.favorites.push(story);
        await this._addOrRemoveFavorite("add", story);
    }

    /** Remove a story from the user's list of favorites and update API 
     * 
    */
    async removeFavorite(story){
        this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
        await this._addOrRemoveFavorite("remove", story);
    }

    async _addOrRemoveFavorite(command, story){
        const method = command === "add" ? "POST" : "DELETE";
        const token = this.loginToken;
        await axios({
        url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
        method: method,
        data: { token },
        })
    }

    /** Determines if the user's story is favorited or not. */
    isFavorite(story) {
        return this.favorites.some(s => (s.storyId === story.storyId));
    }
}