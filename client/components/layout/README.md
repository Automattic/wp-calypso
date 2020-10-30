# Layout

This component renders a two column layout and works together with the `column` component.

## How to use
```js
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import { Card } from '@automattic/components';

function render() {
	return(
		<Layout>
			<Column type='main'>
				<Card>
					This is the main column
				</Card>
			</Column>

			<Column type='sidebar'>
				<Card>
					This is the sidebar
				</Card>
			</Column>
		</Layout>
	)
}
```


## Layout Props

- `likeCount`: the number of likes.

## Columns Props

- `likeCount`: the number of likes.
