import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Popover } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback, PropsWithChildren } from 'react';
import AddNewSiteButton from './button';
import { AsyncContent } from './content/async';
import './style.scss';

interface Props extends PropsWithChildren {
	showCompact: boolean;
}

export const SitesAddNewSitePopover = ( { showCompact }: Props ) => {
	const [ isOpen, setIsOpen ] = useState< boolean >( false );
	const translate = useTranslate();

	const toggleMenu = useCallback( () => {
		recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_add' );
		setIsOpen( ( open ) => ! open );
	}, [] );

	return (
		<AddNewSiteButton
			showMainButtonLabel={ ! showCompact }
			mainButtonLabelText={ translate( 'Add new site' ) }
			isMenuVisible={ isOpen }
			toggleMenu={ toggleMenu }
		>
			{ isOpen && (
				<Popover noArrow={ false } placement="bottom-end" offset={ 10 }>
					<div className="sites-add-new-site__popover-content">
						<AsyncContent />
					</div>
				</Popover>
			) }
		</AddNewSiteButton>
	);
};
