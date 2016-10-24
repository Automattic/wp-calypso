# Reader Post Actions

A selection of action buttons typically displayed at the end of a post in the Reader.

## Usage

```jsx
function MyPostActions() {
	return <ReaderPostActions post={ post } site={ site } />;
}
```

## Props

### `post`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The post object being displayed.

### `site`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Where available, the site object for the current post. This will only be available for wordpress.com and Jetpack posts. It is used to determine whether the user has permission to edit the current post.

### `onCommentClick`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

A function to be fired when the comment button is clicked.

### `showEdit`

<table>
	<tr><th>Type</th><td>Boolean</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Should we show the Edit button?
