# InputChrono

React component that creates a Date object from a user-entered textual date description.

## Example Usage

```js
import InputChrono from 'calypso/components/input-chrono';

export default class extends React.Component {
	// ...

	onSet( date ) {
		console.log( `date %s`, date );
	}

	render() {
		return <InputChrono onSet={ this.onSet } />;
	}
}
```

### Props

`value` - **optional** initial input value

`onSet` - **optional** Bound function called when a Date object is created.
It's checked when the input loses the focus or when an enter key down is
detected.
