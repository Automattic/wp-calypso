import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { ComponentProps } from 'react';
import { ButtonProps } from '../types';

export const normalizeButtonProps = < T extends ComponentProps< typeof Button > >(
	button: ButtonProps,
	standardProps: T
): T => {
	if ( Object.keys( button ).length === 1 && 'onClick' in button ) {
		return {
			...standardProps,
			onClick: button.onClick,
			children: standardProps.label,
		};
	}

	return {
		...standardProps,
		...button,
		children: button.label ?? standardProps.label,
		className: clsx( standardProps.className, button.className ),
	};
};
