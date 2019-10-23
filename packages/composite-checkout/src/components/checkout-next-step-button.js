/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from './button';

export default function CheckoutNextStepButton( { value, onClick } ) {
	return (
		<Button onClick={ onClick } buttonState="primary">
			{ value }
		</Button>
	);
}
