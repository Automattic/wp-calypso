# Reader Avatar

Display an avatar for a feed, site and/or author.

If both a feed/site icon and author Gravatar are available, they will be overlaid on top of each other.

## Example

```html
<ReaderAvatar author={ author } siteIcon={ siteIcon } isCompact={ true } />
```

## Props

### `author` (required)

An author object to pull the author info from.

### `siteIcon`

URL to the site icon image.

### `feedIcon`

URL to the feed icon image.

### `siteUrl`

If present, the avatar will be linked to this URL.

### `preferGravatar`

If we have an avatar and we prefer it, don't even consider the site icon.

### `showPlaceholder`

Show a loading placeholder if the icons/author are not yet available.

### `isCompact`

Show a small version of the avatar. Used in post cards and streams.

### `onClick`

Click handler to be executed when avatar is clicked.
