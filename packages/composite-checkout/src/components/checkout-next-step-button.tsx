/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button, { ButtonProps } from './button';

function CheckoutNextStepButton( {
	value,
	onClick,
	ariaLabel,
	...props
}: CheckoutNextStepButtonProps &
	ButtonProps &
	React.ButtonHTMLAttributes< HTMLButtonElement > ): JSX.Element {
	return (
		<Button onClick={ onClick } buttonType="primary" aria-label={ ariaLabel } { ...props }>
			{ value }
		</Button>
	);
}

interface CheckoutNextStepButtonProps {
	value: React.ReactNode;
	onClick: () => void;
	ariaLabel: string;
}

export default CheckoutNextStepButton;
