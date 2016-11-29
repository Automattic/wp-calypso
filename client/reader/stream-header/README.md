# Reader Stream Header

The header for a stream in the Reader.

## Props

- isPlaceholder: bool, whether or not this is a placeholder.
- title: string, the title of the stream.
- description: string, a description for the stream. No HTML.
- showFollow: bool, true if we should show a follow toggle.
- showEdit: bool, true if we should show an edit icon.
- editUrl: string, the URL to link the edit icon to, if using
- following: bool, represents whether the current user if following this stream
- onFollowToggle: function, a callback invoked when the follow button is toggled
