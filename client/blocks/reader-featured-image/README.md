# Reader Featured Image

Displays a featured image for a Reader post card.

## Example

The component outputs an `<a>` element with imageUrl as a background image. It wraps whatever is placed between the ReaderFeaturedImage elements (we use this to add a play button to video thumbnails, for example).

```html
<ReaderFeaturedImage imageUrl={ imageUrl } href={ href } />
```

```html
<ReaderFeaturedImage imageUrl={ imageUrl } href={ href }>[button]</ReaderFeaturedImage>
```

## Props

- `imageUrl`: Image URL
- `href`: The URL to link the featured image to
- `onClick`: Function to execute when image is clicked
