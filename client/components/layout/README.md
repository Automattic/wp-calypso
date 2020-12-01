# Layout

This component renders a two column layout and works together with the `column` component.

## How to use

```js
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import { Card } from '@automattic/components';

function render() {
	return (
		<Layout>
			<Column type="main">
				<Card>
					<p>This is the main column</p>
				</Card>
			</Column>

			<Column type="sidebar">
				<Card>
					<p>This is the sidebar</p>
				</Card>
			</Column>
		</Layout>
	);
}
```

## Layout Props

- `className`: Add a custom classname

## Columns Props

- `type`: Pick `main` or `sidebar`.
