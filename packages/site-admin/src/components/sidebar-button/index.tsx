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
type ButtonProps = React.ComponentProps< typeof Button >;

export function SidebarButton( props: ButtonProps ) {
	return (
		<Button
			size="compact"
			{ ...props }
			className={ clsx( 'a8c-site-admin-sidebar-button', props.className ) }
		/>
	);
}
