/**
 * External dependencies
 */
import { Button as OriginalButton } from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../constants';
import './style.scss';

const Button = ( {
	children,
	...rest
}: OriginalButton.Props & { icon?: any; iconSize?: number; showTooltip?: boolean } ) => (
	<OriginalButton { ...rest }>{ children }</OriginalButton>
);

export default function ToggleSidebarButton() {
	const { toggleSidebar } = useDispatch( STORE_KEY );
	const isSidebarOpen = useSelect( ( select ) => select( STORE_KEY ).isSidebarOpened() );
	const isSidebarClosing = useSelect( ( select ) => select( STORE_KEY ).isSidebarClosing() );

	const handleClick = () => {
		recordTracksEvent( `calypso_editor_sidebar_open` );
		toggleSidebar();
	};

	return (
		<Button
			label={ __( 'Block editor sidebar', 'full-site-editing' ) }
			showTooltip
			className={ classnames(
				'edit-post-fullscreen-mode-close',
				'wpcom-block-editor-nav-sidebar-toggle-sidebar-button__button',
				{
					'is-hidden': isSidebarOpen || isSidebarClosing,
				}
			) }
			icon={ wordpress }
			iconSize={ 36 }
			onClick={ handleClick }
			aria-haspopup="dialog"
			aria-expanded={ isSidebarOpen }
		/>
	);
}
