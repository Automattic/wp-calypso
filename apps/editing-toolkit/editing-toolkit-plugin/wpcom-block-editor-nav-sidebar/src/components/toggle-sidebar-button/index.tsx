/**
 * External dependencies
 */
import { Button as OriginalButton } from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../constants';
import './style.scss';

const Button = ( {
	children,
	...rest
}: OriginalButton.Props & { icon?: any; iconSize?: number } ) => (
	<OriginalButton { ...rest }>{ children }</OriginalButton>
);

export default function ToggleSidebarButton() {
	const { toggleSidebar } = useDispatch( STORE_KEY );
	const isSidebarOpen = useSelect( ( select ) => select( STORE_KEY ).isSidebarOpened() );
	const isSidebarClosing = useSelect( ( select ) => select( STORE_KEY ).isSidebarClosing() );

	return (
		<Button
			className={ classnames(
				'edit-post-fullscreen-mode-close',
				'wpcom-block-editor-nav-sidebar-toggle-sidebar-button__button',
				{
					'is-hidden': isSidebarOpen || isSidebarClosing,
				}
			) }
			icon={ wordpress }
			iconSize={ 36 }
			onClick={ toggleSidebar }
		/>
	);
}
