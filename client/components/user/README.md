## UserItem

`UserItem` displays the Gravatar and username of the current user. It takes only one prop:
a user object with a `name` property for the display name.

### Usage

```js
export default class extends React.Component {
	render() {
		return <UserItem user={ currentUser } />;
	}
}
```
