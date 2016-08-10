# Reader Author Link

A link to a author's external site for a given post.

This component does not dictate the content of the link, only the href and click behavior.

## Example

The `ReaderAuthorLink` component can be used in much the same way that you would use an `<ExternalLink>` component. The link wraps whatever is placed between the ReaderAuthorLink elements.

```html
<ReaderAuthorLink post={ post }>Your link text here</ReaderAuthorLink>
```

## Props

### `post`

A post object to pull the site info from. Should have either a feed_ID or a site_ID.