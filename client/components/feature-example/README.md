Feature Example
=======

Feature Example is a component used to render an mocked example of any feature. It renders whatever children it receives. The example is covered by a layer of fading gradient that gives the user a sense of UI that they are missing.

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
