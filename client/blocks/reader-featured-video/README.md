# Reader Featured Video

Displays a featured video for a Reader post card.

## Example

```html
<ReaderFeaturedVideo thumbnailUrl={ thumbnail } videoEmbed={ post.canonical_media } />
```

## Props

- `thumbnailUrl`: image URL for the video thumbnail
- `autoplayIframe`: the iframe HTML element with a url such that it will autoplay when placed in a DOM
- `iframe`: the iframe html element to place in the DOM when the play button has been clicked
- `videoEmbed`: the associated metadata for the embed that the post-normalizer generated. Should contain height/width etc.
- `allowPlaying`: should we show a play button and allow playing of the video in-place? If set to false, only the thumbnail will be displayed
- `onThumbnailClick`: click handler to be executed when the thumbnail is clicked
