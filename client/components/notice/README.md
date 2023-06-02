# Notice

## Notice (JSX)

This component is used to display inline notices, rather than Global ones

### Usage

```js
import Notice from 'calypso/components/notice';

function MyNotice() {
	return (
		<Notice status="is-error" icon="mention">
			This is an error notice with a custom icon.
		</Notice>
	);
}
```

### Props

| Name             | Type       | Default | Description                                                                           |
| ---------------- | ---------- | ------- | ------------------------------------------------------------------------------------- |
| `status`         | `string`   | null    | The status of the notice can be `is-success`, `is-warning`, `is-error`, or `is-info`. |
| `icon`           | `string`   | null    | A reference to a Gridicon.                                                            |
| `isLoading`      | `bool`     | false   | If true, the icon is in an animated loading state.                                    |
| `text`           | `string`   | null    | The message that shows in the notice.                                                 |
| `showDismiss`    | `bool`     | true    | Whether to show a close action on the right of the notice.                            |
| `isCompact`      | `bool`     | false   | Whether this is a compact notice (smaller and not full width).                        |
| `isReskinned`    | `bool`     | false   | Whether to use the newer/updated version used for the plans pages.                    |
| `duration`       | `integer`  | 0       | How long to show the notice for in milliseconds.                                      |
| `onDismissClick` | `function` | null    | A function to call when the notice is dismissed.                                      |
| `children`       | `string`   | null    | You can also pass the content on the notice within children.                          |

## NoticeAction (JSX)

This component is used to display an action inside a notice

### Usage

```js
import NoticeAction from 'calypso/components/notice/notice-action';

function MyNotice() {
	return (
		<Notice status="is-error" icon="mention" text="This is an error notice with a custom icon.">
			<NoticeAction href="#" external>
				Update
			</NoticeAction>
		</Notice>
	);
}
```

### Props

| Name       | Type       | Default | Description                                                                               |
| ---------- | ---------- | ------- | ----------------------------------------------------------------------------------------- |
| `href`     | `string`   | null    | The location to take the user to.                                                         |
| `onClick`  | `function` | null    | A function to call when the action is clicked.                                            |
| `external` | `bool`     | false   | If true then an `external` Gridicon will be added and the link will open in a new window. |
| `icon`     | `string`   | null    | A reference to a Gridicon.                                                                |
