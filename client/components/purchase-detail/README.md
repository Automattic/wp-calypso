Purchase Detail
===============

This component renders a box with a title, description, button, and icon, based on the given props. It is used to display information about an item that the user purchased.

## Usage

```js
import React from 'react';
import PurchaseDetail from 'components/purchase-detail';

export default React.createClass( {
	render() {
		return (
			<PurchaseDetail
				icon="time"
				title={ this.translate( 'Important!' ) }
				description={ this.translate( "Your domain mapping won't work until you update the DNS settings." ) }
				buttonText={ this.translate( 'Learn More' ) }
				href="https://support.wordpress.com"
				target="_blank" />
		);
	}
} );
```

## Props

- *buttonText* (string) – text of the `Button`
- *description* (string or array) – text of the description
- *href* (string) – URL passed as the `href` prop for the `Button`
- *icon* (string) – icon slug passed as the `icon` prop of the `Gridicon`
- *isPlaceholder* (boolean) – determines whether or not to render shimmering placeholders
- *isRequired* (boolean) – adds a notice icon next to the main icon
- *requiredText* (string) – adds a notice to the top, determines the text in that notice
- *target* (string) – target passed as the `target` prop for the `Button`
- *title* (string) – string used as the text of the heading
