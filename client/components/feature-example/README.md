Feature Example
=======

Feature Example is a component used to render an mocked example of any feature. It renders whatever childrens it receives, covered but a layer of gradiented opacity.

## Usage

```jsx

import React from 'react';
import ExternalLink from 'components/feature-example';
import EmptyContent from 'components/empty-content';

React.createClass( {
	render() {
		return (
			<FeatureExample>
				<EmptyContent />
			</FeatureExample>
		);
	}
} );
```
