# Loading Placeholder

## Usage

```js
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import LoadingPlaceholder from 'calypso/me/purchases/components/loading-placeholder';

const MyComponentLoadingPlaceholder = ( { translate } ) => (
	<LoadingPlaceholder title={ translate( 'Header title' ) }>
		<Card>{ translate( 'Loading…' ) }</Card>
	</LoadingPlaceholder>
);

export default localize( MyComponentLoadingPlaceholder );
```

## Props

- `path` - **optional** Add a path where back button should lead to.
- `title` - Add a header title.
