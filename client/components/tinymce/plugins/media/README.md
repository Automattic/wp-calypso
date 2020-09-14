# TinyMCE Media Plugin

The media plugin encapsulates all behavior related to the Calypso media library experience. This includes:

- Adding the media button to the TinyMCE toolbar, rendering the media library modal upon click
- Inserting media from the media library to the editor instance
- Rendering a [`<DropZone />`](../../../drop-zone) component on the editor page for dropping files to the editor
- Supporting the insertion of and managing replacement of in-progress media uploads
- Adding the caption button to the inline image toolbar, enabling a user to caption editor images
- Adding the resize toggle buttons to the inline image toolbar, enabling a user to resize editor images
- Adding the edit button to the inline gallery toolbar, enabling a user to edit galleries from post content
- Triggering editor autoresize on image load to prevent content clipping
- Fetching media details from editor image content, such that thumbnail sizes can be used in resizing
- Substituting downsized alternatives to large images while still retaining markup for original
