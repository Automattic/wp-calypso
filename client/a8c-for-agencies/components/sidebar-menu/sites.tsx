import page from '@automattic/calypso-router';
import { chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Sidebar from '../sidebar';
import useSitesMenuItems from './hooks/use-sites-menu-items';
import { A4A_OVERVIEW_LINK, A4A_SITES_LINK } from './lib/constants';

type Props = {
	path: string;
};

export default function ( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = useSitesMenuItems( path );

	return (
		<Sidebar
			path={ A4A_SITES_LINK }
			title={ translate( 'Sites' ) }
			description={ translate( 'Manage all your sites and Jetpack services from one place.' ) }
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
