import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { ComponentProps } from 'react';
import { ButtonProps } from '../types';

export const normalizeButtonProps = < T extends ComponentProps< typeof Button > >(
	button: ButtonProps,
	standardProps: T
): T => ( {
	...standardProps,
	...button,
	children: button.children ?? standardProps.children,
	className: clsx( standardProps.className, button.className ),
} );
