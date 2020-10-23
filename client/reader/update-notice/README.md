# Reader Update Notice

A little pill that is used to notify the user when new posts are available.

## Usage

```jsx
import UpdateNotice from 'calypso/reader/update-notice';

class MyComponent extends React.Component {
	constructor() {
		super();
		this.handleNoticeClick = function () {
			/* do something */
		};
	}
	render() {
		return <UpdateNotice count={ 5 } onClick={ this.handleNoticeClick } />;
	}
}
```

## Props

- `count` - the number of updates that are available
- `onClick` - a callback to call when the notice is cliced on
