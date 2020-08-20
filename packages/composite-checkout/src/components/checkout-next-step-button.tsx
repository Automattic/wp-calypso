/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from './button';

export default function CheckoutNextStepButton( {
	value,
	onClick,
	ariaLabel,
	...props
}: {
	value: React.ReactChildren;
	onClick: () => void;
	ariaLabel: string;
	props: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
} ) {
	return (
		<Button onClick={ onClick } buttonType="primary" aria-label={ ariaLabel } { ...props }>
			{ value }
		</Button>
	);
}
