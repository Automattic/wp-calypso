# Meta Title Editor

This component provides an interactive editor for managing custom SEO title formats. It is built to arrange format strings which will be used to generate titles that overwrite a blog site's theme-generated titles.

The following are examples of legitimate format strings passed from the server.

```js
// for a front page
'%site_name% | %tagline%'

// for a post
'%post_title% on %site_name%'
```

The format is arbitrary text with zero or more percentage-sign-delineated tokens. There are a defined number of possible tokens for each kind of title: front page, post, page, comment or tag page, archives.

## Displays and Helpers

The display for this component is built from a segmented control (to select which kind of title is being formatted) and a token field (to edit the actual title format).

In order to make it easier for the user to edit, we are using the token field to render the token placeholders. This provides a nice visual to separate plain text from content that will be rendered from their site.

Thus we have two forms of data to work with:
 - The raw string that gets passed between Calypso and the API and exists in the meta on the server
 - The native JavaScript representation of the raw string, which is an array of plain text elements and placeholders which identify some site or page-specific value

Helper functions have been created to map between these formats.
