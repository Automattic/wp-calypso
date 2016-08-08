# Reader Daily Post

The component wraps a Button and SitesPopover to set up a new post in the editor for a [Daily Post](dailypost.wordpress.com) prompt or challenge.

## Component Props

- `tagName`: a string or ReactComponent, the root rendering component.
- `position`: string, the SitesPopover position relative to the Button
- `post`: object, the Daily Post post


## Helper

Use the `isDailyPost` helper function to assert the post is from dailypost.wordpress.com.
