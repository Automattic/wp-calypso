Purchase Detail
===============

This component renders a box with a title, description, button, and icon, based on the given props. It is used to display information about an item that the user purchased.

## Usage

```js
import React from 'react';
import { localize } from 'i18n-calypso';
import PurchaseDetail from 'components/purchase-detail';

const MyComponent = ( { translate } ) => (
	<PurchaseDetail
		icon="time"
		title={ translate( 'Important!' ) }
		description={ translate( "Your domain mapping won't work until you update the DNS settings." ) }
		buttonText={ translate( 'Learn More' ) }
		href="https://wordpress.com/support"
		target="_blank"
	/>
);

export default localize( MyComponent );
```

## Props

- *buttonText* (string) – text of the `Button`
- *description* (string or array) – text of the description
- *href* (string) – URL passed as the `href` prop for the `Button`
- *icon* (string) – icon slug passed as the `icon` prop of the `Gridicon`
- *isPlaceholder* (boolean) – determines whether or not to render shimmering placeholders
- *isRequired* (boolean) – adds a notice icon next to the main icon
- *primaryButton* (boolean) — determines whether the CTA button is primary ( default: `false` )
- *requiredText* (string) – adds a notice to the top, determines the text in that notice
- *target* (string) – target passed as the `target` prop for the `Button`
- *title* (string) – string used as the text of the heading
