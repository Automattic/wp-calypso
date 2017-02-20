# Reader Visit Link

A link to an external site from Reader, labelled 'Visit'.

## Example

The component can be used in much the same way that you would use an `<a>` element. The link wraps whatever is placed between the ReaderVisitLink elements.

```html
<ReaderVisitLink url={ post.URL }>Visit this</ReaderVisitLink>
```

## Props

### `href`

The URL to link to.

### `iconSize`

Size of the visit icon. Defaults to 24px.

### `onClick`

Function to execute when the visit link is clicked.
