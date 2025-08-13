import {
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControl as InputControl,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
} from '@wordpress/components';
import React from 'react';

export default function SuffixInputControl( {
	suffix,
	...props
}: React.ComponentProps< typeof InputControl > ) {
	return (
		<InputControl
			{ ...props }
			suffix={ <InputControlSuffixWrapper variant="control">{ suffix }</InputControlSuffixWrapper> }
		/>
	);
}
