# FollowersData

A component that fetches a site's wpcom followers and passes them to its children.

## Props

`<FollowersData />` should be given a `fetchOptions` object which will be used as parameters for the API call /sites/\$site/stats/followers

## Usage

A component wrapped with `<FollowersData />` will receive the following props:

- followers: An array of follower objects
- totalFollowers: The total number of followers found for the site
- currentPage: The last page that was fetched from the API
- fetching: A boolean that is true if the fetch is in progress
- fetchInitialized: A boolean that states if the fetch has been initialized yet
