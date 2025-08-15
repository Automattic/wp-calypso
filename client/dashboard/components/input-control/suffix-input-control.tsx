import {
	__experimentalInputControl as InputControl,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
} from '@wordpress/components';
import type React from 'react';

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
