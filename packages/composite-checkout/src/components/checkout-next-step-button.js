/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from './button';

export default function CheckoutNextStepButton( { value, onClick, ariaLabel, ...props } ) {
	return (
		<Button onClick={ onClick } buttonState="primary" aria-label={ ariaLabel } { ...props }>
			{ value }
		</Button>
	);
}
