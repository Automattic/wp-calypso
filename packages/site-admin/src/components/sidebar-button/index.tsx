/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import './style.scss';
/**
 * Types
 */
import type { ButtonProps } from '@wordpress/components/build-types/button/types';

export function SidebarButton( props: ButtonProps ) {
	return (
		<Button
			size="compact"
			{ ...props }
			className={ clsx( 'site-admin-sidebar-button', props.className ) }
		/>
	);
}
