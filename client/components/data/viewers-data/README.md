# ViewersData

A component that fetches a private wpcom site's viewers and passes them to its children.

## Props

`<ViewersData />` should be given a `siteId` which will be used in the path for the API call to /sites/\$site/viewers

## Usage

A component wrapped with `<ViewersData />` will receive the following props:

- viewers: An array of viewer objects
- totalViewers: The total number of viewers found for the site
- currentPage: The last page that was fetched from the API
- fetching: A boolean that is true if the fetch is in progress
- fetchInitialized: A boolean that states if the fetch has been initialized yet
