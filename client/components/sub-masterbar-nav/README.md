# Sub Masterbar Nav

This component displays a navigation header under the masterbar.

## How to use

The component should be inserted into a `Main` component.
Options should contain a `label` and an `uri`. If the latter matches the `uri` property of the component, it will be marked as selected.
In case no option is selected, the `fallback` value will be shown in the dropdown.

`icon` should be a valid gridicon name. The icon will be displayed next to/on top of the label.
If no `icon` is provided, `star` will be used by default.

```js
import SubMasterbarNav from 'calypso/components/sub-masterbar-nav';

const options = [
	{
		label: 'Home',
		uri: '/',
		icon: 'house',
	},
];

export default class extends React.Component {
	render() {
		return (
			<Main>
				<SubMasterbarNav options={ options } fallback={ options[ 0 ] } uri={ '/foo/bar' } />
			</Main>
		);
	}
}
```
