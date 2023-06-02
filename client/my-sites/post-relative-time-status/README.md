# PostRelativeTimeStatus

This module provides a React component to display a post's relative time & status (either last modified or published, depending on status).

## Props

### Post (Post object)

The Post object.

### link (string: default null)

Determines whether the time will link to a URL.

### target (string: default null)

If `link` is non-null, the link will use this target.

### onClick (function)

If `link` is non-null, this function will be called on click.

### includeBasicStatus (boolean: default false)

This component shows certain special statuses are shown regardless; 'sticky', 'scheduled', 'pending review', 'trash'. By default no status is shown for 'draft' and 'published' posts, unless this prop is set to `true`.
