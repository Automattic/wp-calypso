# Global Notices

Render notices from global application state.

This component should be rendered exactly _one_ time, presumably in the global application layout.

## Adding a notice

Notices should be added by dispatching a notice action. See [notice actions](../../state/notices/actions.js).

Dispatching a notice from a component might look like this:

```js
import { successNotices } from 'calypso/state/notices/actions';

function MyComponent() {
	return <button onClick={ this.props.successNotice( 'Objective achieved!' ) }>Click me!</button>;
}

export default connect( null, { successNotice } )( MyComponent );
```

## Usage

It's unlikely you'll need to render GlobalNotices, because that will be handled by layout.

Rendering GlobalNotices is straightforward:

```js
import GlobalNotices from 'calypso/components/global-notices';

function Layout() {
	return (
		<div>
			<GlobalNotices />
		</div>
	);
}
```
