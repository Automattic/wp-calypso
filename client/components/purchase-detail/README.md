# Purchase Detail

This component renders a box with a title, description, button, and icon, based on the given props. It is used to display information about an item that the user purchased.

## Usage

```js
import React from 'react';
import { localize } from 'i18n-calypso';
import PurchaseDetail from 'calypso/components/purchase-detail';

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

- _buttonText_ (string) – text of the `Button`
- _description_ (string or array) – text of the description
- _href_ (string) – URL passed as the `href` prop for the `Button`
- _icon_ (string) – icon slug passed as the `icon` prop of the `Gridicon`
- _isPlaceholder_ (boolean) – determines whether or not to render shimmering placeholders
- _isRequired_ (boolean) – adds a notice icon next to the main icon
- _primaryButton_ (boolean) — determines whether the CTA button is primary ( default: `false` )
- _requiredText_ (string) – adds a notice to the top, determines the text in that notice
- _target_ (string) – target passed as the `target` prop for the `Button`
- _title_ (string) – string used as the text of the heading
