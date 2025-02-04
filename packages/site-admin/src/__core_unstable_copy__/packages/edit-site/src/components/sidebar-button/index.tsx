/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import './style.scss'; // @Todo: different from core: not imported in this way
import { unstableResourceWarning } from '../../../../../debug';

export default function SidebarButton( props: React.ComponentProps< typeof Button > ) {
	unstableResourceWarning(
		'<SidebarButton />',
		'https://github.com/WordPress/gutenberg/blob/56883338749aa23acc75481c3bbc605bf1cb5a81/packages/edit-site/src/components/sidebar-button/index.js#L11'
	);

	return (
		<Button
			size="compact"
			{ ...props }
			className={ clsx( 'edit-site-sidebar-button', props.className ) }
		/>
	);
}
