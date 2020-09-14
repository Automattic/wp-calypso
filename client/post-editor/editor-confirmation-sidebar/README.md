# EditorConfirmationSidebar

This displays a sidebar that contains a confirmation dialog shown before
publishing.

It's mostly unremarkable, save for the fact that it's been optimized for
performance by adding a deferred state.

As the component starts up, if it is in a 'closed' status, it will not render.
This provides a small performance improvement by avoiding the instantiation of
the entire component rendering tree, as it's not yet needed.

As soon as the status changes to something other than 'closed', the component
renders, and from that moment on, any changes to status (e.g. closing again)
will be applied via CSS, since the cost of rendering the sub-tree has already
been paid.

The following diagram helps to illustrate the flow:

![component state diagram](https://user-images.githubusercontent.com/5431237/49047676-6ca56580-f195-11e8-88ea-9084eb454b53.png)
