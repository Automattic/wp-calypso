import page from '@automattic/calypso-router';
import { chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Sidebar from '../sidebar';
import usePurchasesMenuItems from './hooks/use-purchases-menu-items';
import { A4A_OVERVIEW_LINK, A4A_PURCHASES_LINK } from './lib/constants';

type Props = {
	path: string;
};

export default function ( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = usePurchasesMenuItems( path );

	return (
		<Sidebar
			path={ A4A_PURCHASES_LINK }
			title={ translate( 'Purchases' ) }
			description={ translate( 'Manage all your billing related settings from one place.' ) }
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
