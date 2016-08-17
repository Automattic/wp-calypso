# Reader Author Link

A link to a author's external site for a given post.

This component does not dictate the content of the link, only the href and click behavior.

## Example

The `ReaderAuthorLink` component can be used in much the same way that you would use an `<ExternalLink>` component. The link wraps whatever is placed between the ReaderAuthorLink elements.

```html
<ReaderAuthorLink author={ author } siteUrl={ siteUrl }>Your link text here</ReaderAuthorLink>
```

## Props

### `author` (required)

An author object to pull the author info from.

### `siteUrl`

A site URL to use for the link in case author.URL is missing.

### `post`

A post object, used for stats only. If provided, we fire recordTrackForPost() when the link is clicked.
