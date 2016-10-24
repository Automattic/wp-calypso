# Reader Site Stream Link

A link to a Reader site stream (e.g. /read/feeds/123 or /read/blogs/123).

This component does not dictate the content of the link, only the href and click behavior.

## Example

The `ReaderSiteStreamLink` component can be used in much the same way that you would use an `<a>` element. The link wraps whatever is placed between the ReaderSiteStreamLink elements.

```html
<ReaderSiteStreamLink post={ post }>Your link text here</ReaderSiteStreamLink>
```

## Props

### `post`

A post object to pull the site info from. Should have either a feed_ID or a site_ID.

### Other props

Any other props that you pass into the `a` tag will be rendered as expected (for example `onClick` and `href`).