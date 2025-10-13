import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dropdown } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
<<<<<<< HEAD
import { AuthProvider } from '../../dashboard/app/auth';
=======
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { AuthContext } from '../../dashboard/app/auth';
>>>>>>> 185a5a577d7 (Show Flex site creation button for eligible users)
import { AsyncContent } from './async';
import AddNewSiteButton from './button';
import type { AddNewSiteProps } from '../../dashboard/sites/add-new-site/types';
import type { PropsWithChildren } from 'react';
import './style.scss';

interface Props extends PropsWithChildren {
	showCompact: boolean;
	context: AddNewSiteProps[ 'context' ];
}

export const SitesAddNewSitePopover = ( { showCompact, context }: Props ) => {
	const translate = useTranslate();
	const user = useSelector( getCurrentUser ) as any;

	return (
		<AuthProvider>
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
						<AsyncContent context={ context } />
					</div>
				) }
				onToggle={ ( isOpen ) => {
					if ( isOpen ) {
						recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_open' );
					}
				} }
			/>
		</AuthProvider>
	);
};
