# Site Comments

Fulfills `COMMENTS_LIST_REQUEST` actions by grabbing a list of recent comments from the site comments API endpoint.
Currently uses the `COMMENTS_RECEIVE` action since the comment reducers already exist for this, but in the future this should be changed to a more semantic action like `COMMENTS_ADD` when it becomes available.
When comments come back which belong to different posts this will dispatch multiple `COMMENTS_RECEIVE` actions - one for each post.
This is a consequence of the way that the comment reducers were originally built.
