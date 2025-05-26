import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dropdown } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { AsyncContent } from './async';
import AddNewSiteButton from './button';
import type { PropsWithChildren } from 'react';
import './style.scss';

interface Props extends PropsWithChildren {
	showCompact: boolean;
}

export const SitesAddNewSitePopover = ( { showCompact }: Props ) => {
	const translate = useTranslate();

	return (
		<Dropdown
			popoverProps={ { placement: 'bottom-end', offset: 10, noArrow: false } }
			focusOnMount
			renderToggle={ ( { isOpen, onToggle } ) => (
				<AddNewSiteButton
					showMainButtonLabel={ ! showCompact }
					mainButtonLabelText={ translate( 'Add new site' ) }
					isMenuVisible={ isOpen }
					isPrimary={ ! showCompact }
					toggleMenu={ onToggle }
				/>
			) }
			renderContent={ () => (
				<div className="sites-add-new-site__popover-content">
					<AsyncContent />
				</div>
			) }
			onToggle={ ( isOpen ) => {
				if ( isOpen ) {
					recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_open' );
				}
			} }
		/>
	);
};
