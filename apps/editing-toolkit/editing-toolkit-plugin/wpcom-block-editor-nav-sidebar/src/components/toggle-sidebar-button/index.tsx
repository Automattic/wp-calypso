import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button as OriginalButton } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { store } from '../../store';
import SiteIcon from '../site-icon';
import './style.scss';

const Button = ( {
	children,
	...rest
}: OriginalButton.Props & { icon?: unknown; iconSize?: number; showTooltip?: boolean } ) => (
	<OriginalButton { ...rest }>{ children }</OriginalButton>
);

export default function ToggleSidebarButton() {
	const { toggleSidebar } = useDispatch( store );
	const isSidebarOpen = useSelect( ( select ) => select( store ).isSidebarOpened(), [] );

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
				'has-icon',
				{
					'is-hidden': isSidebarOpen,
				}
			) }
			onClick={ handleClick }
			aria-haspopup="dialog"
			aria-expanded={ isSidebarOpen }
		>
			<SiteIcon />
		</Button>
	);
}
