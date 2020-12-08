/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button, { ButtonProps } from './button';

const CheckoutNextStepButton: React.FC<
	CheckoutNextStepButtonProps & ButtonProps & React.ButtonHTMLAttributes< HTMLButtonElement >
> = ( { value, onClick, ariaLabel, ...props } ) => {
	return (
		<Button onClick={ onClick } buttonType="primary" aria-label={ ariaLabel } { ...props }>
			{ value }
		</Button>
	);
};

interface CheckoutNextStepButtonProps {
	value: React.ReactChildren;
	onClick: () => void;
	ariaLabel: string;
}

export default CheckoutNextStepButton;
