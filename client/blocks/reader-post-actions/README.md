# Reader Post Actions

A selection of action buttons typically displayed at the end of a post in the Reader.

## Usage

```jsx
function MyPostActions() {
	return <ReaderPostActions post={ post } site={ site } />;
}
```

## Props

| Prop             |   Type   | Required | Description                                                                                                                                                                                               |
| ---------------- | :------: | :------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `post`           |  Object  |   Yes    | The post object being displayed                                                                                                                                                                           |
| `site`           |  Object  |   Yes    | Where available, the site object for the current post. This will only be available for wordpress.com and Jetpack posts. It is used to determine whether the user has permission to edit the current post. |
| `onCommentClick` | Function |    No    | A function to be fired when the comment button is clicked.                                                                                                                                                |
| `showEdit`       | Boolean  |    No    | Should we show the Edit button?                                                                                                                                                                           |
| `visitUrl`       |  String  |    No    | Url used for the visit link. The link will use the `post` url if this prop is omitted.                                                                                                                    |
