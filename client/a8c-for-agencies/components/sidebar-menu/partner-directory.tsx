import page from '@automattic/calypso-router';
import { chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Sidebar from 'calypso/a8c-for-agencies/components/sidebar';
import {
	A4A_OVERVIEW_LINK,
	A4A_PARTNER_DIRECTORY_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import usePartnerDirectoryMenuItems from './hooks/use-partner-directory-menu-items';

type Props = {
	path: string;
};

export default function ( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = usePartnerDirectoryMenuItems( path );

	return (
		<Sidebar
			path={ A4A_PARTNER_DIRECTORY_LINK }
			title={ translate( 'Partner Directory' ) }
			description={ translate( 'Boost your agency’s visibility across Automattic platforms.' ) }
			backButtonProps={ {
				label: translate( 'Back to overview' ),
				icon: chevronLeft,
				onClick: () => {
					page( A4A_OVERVIEW_LINK );
				},
			} }
			menuItems={ menuItems }
			withUserProfileFooter
		/>
	);
}
