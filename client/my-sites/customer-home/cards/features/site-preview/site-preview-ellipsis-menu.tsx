import { Gridicon } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export const SitePreviewEllipsisMenu = () => {
	const { __ } = useI18n();

	const moreButtonRef = useRef( null );
	const [ isShowingPopover, setIsShowingPopover ] = useState( false );

	const classes = clsx( 'home-site-preview__ellipses-button', {
		'is-open': isShowingPopover,
	} );
	const selectedSite = useSelector( getSelectedSite );

	return (
		<span className={ classes }>
			<button
				aria-label={ sprintf(
					/* translators: %s is the site name */
					__( 'More options for site %s' ),
					selectedSite?.name
				) }
				ref={ moreButtonRef }
				onClick={ () => setIsShowingPopover( ! isShowingPopover ) }
			>
				<Gridicon icon="ellipsis" size={ 24 } />
			</button>
			{ isShowingPopover && (
				<PopoverMenu
					context={ moreButtonRef.current }
					isVisible
					onClose={ () => setIsShowingPopover( false ) }
					position="bottom left"
				>
					<PopoverMenuItem
						key="settings-link"
						onClick={ () => {
							recordTracksEvent( 'calypso_customer_home_site_preview_menu_item_clicked', {
								context: 'customer-home',
								item: 'settings',
							} );
						} }
						href={ `/settings/general/${ selectedSite?.slug }` }
					>
						{ __( 'Settings' ) }
					</PopoverMenuItem>
					<PopoverMenuItem
						key="domain-link"
						onClick={ () => {
							recordTracksEvent( 'calypso_customer_home_site_preview_menu_item_clicked', {
								context: 'customer-home',
								item: 'manage-domains',
							} );
						} }
						href={ `/domains/manage/${ selectedSite?.slug }` }
					>
						{ __( 'Manage domains' ) }
					</PopoverMenuItem>
				</PopoverMenu>
			) }
		</span>
	);
};
