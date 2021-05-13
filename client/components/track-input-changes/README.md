## TrackInputChanges

`TrackInputChanges` is a utility component to assist in tracking changes on
text input elements when recording analytics.

It wraps a text input component
(`input` / `FormTextInput`, `textarea` / `FormTextarea`) and adds a new
callback `onNewValue` which fires when the input field receives one or more
`change` events followed by a `blur` event. This is meant to capture the user
action of making a change to a text field.

### Usage

```js
export default class extends React.Component {
	render() {
		return (
			<TrackInputChanges onNewValue={ this.recordSomeStat }>
				<FormTextInput
					value="whatever"
					onChange={ this.handleChangeEvent }
					onBlur={ this.handleBlurEvent }
				/>
			</TrackInputChanges>
		);
	}
}
```
