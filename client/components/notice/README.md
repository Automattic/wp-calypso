Notice (JSX)
====================

This component is used to display inline notices, rather than Global ones

-------

#### How to use:

```js
import Notice from 'components/notice';

function MyNotice() {
	return (
		<Notice
			status="is-error"
			icon="mention"
		>
			I'm an error notice with a custom icon.
		</Notice>
	)
}
```

--------

#### Props

* `status`: (string) The status of the notice, one of `success`, `warning`, `error` or `info`. Default null.
* `icon`: (string) A reference to a Gridicon. Default null.
* `isLoading`: (bool) If true the icon is in an animated loading state. Default false.
* `text`: (string) The message that shows in the notice. Default null.
* `showDismiss`: (bool) Whether to show a close action on the right of the notice. Default true.
* `isCompact`: (bool) Whether this is a compact notice (smaller and not full width). Default false.
* `duration`: (number) How long to show the notice for in milliseconds. Default 0.
* `onDismissClick`: (function) A function to call when the notice is dismissed. Default null.
* `children`: You can also pass the content on the notice within children


NoticeAction (JSX)
====================

This component is used to display an action inside a notice

-------

#### How to use:

```js
import NoticeAction from 'components/notice/notice-action';

function MyNotice() {
	return (
		<Notice
			status="is-error"
			icon="mention"
		>
			I'm an error notice with a custom icon.
			<NoticeAction href="#" external>{ 'Update' }</NoticeAction>
		</Notice>
	)
}
```

--------

#### Props

* `href`: (string) The location to take the user to
* `onClick`: (function) A function to call when the action is clicked
* `external`: (bool) If true then an `external` Gridicon will be added and the link will open in a new window
* `icon`: (string) A reference to a Gridicon
