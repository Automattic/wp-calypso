# Section Header

This component is used to display a header with a label
and optional actions buttons.

## Example Usage

```js
import React from 'react';
import { localize } from 'i18n-calypso';

import SectionHeader from 'calypso/components/section-header';
import { Button } from '@automattic/components';

const MyHeader = ( { translate } ) => (
	<SectionHeader label={ translate( 'Team' ) }>
		<Button compact>{ translate( 'Manage' ) }</Button>
		<Button
			compact
			onClick={ function () {
				console.log( 'Clicked Add button' );
			} }
		>
			{ translate( 'Add' ) }
		</Button>
	</SectionHeader>
);

export default localize( MyHeader );
```

## Section Header

This is the base component and acts as a wrapper for a section's (a list of cards) title and any action buttons that act upon that list (like Bulk Edit or Add New Item).

### Props

- `className` - _optional_ (string|object) Classes to be added to the rendered component.
- `label` - _optional_ (string) The text to be displayed in the header.
- `popoverText` - _optional_ (string) If entered, a support popover will appear to the right with this text.

## General guidelines

- Use clear and accurate labels.
- Use sentence-style capitalization except when referring to an official/branded feature or service name (e.g. Simple Payments).
