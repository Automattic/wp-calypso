/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import clsx from 'clsx';

/**
 * WordPress dependencies
 */

export default function SidebarButton( props ) {
	return (
		<Button
			size="compact"
			{ ...props }
			className={ clsx( 'edit-site-sidebar-button', props.className ) }
		/>
	);
}
