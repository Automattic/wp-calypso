import page from '@automattic/calypso-router';
import { chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Sidebar from '../sidebar';
import useMarketplaceMenuItems from './hooks/use-marketplace-menu-items';
import { A4A_OVERVIEW_LINK, A4A_PURCHASES_LINK } from './lib/constants';

type Props = {
	path: string;
};

export default function ( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = useMarketplaceMenuItems( path );

	return (
		<Sidebar
			path={ A4A_PURCHASES_LINK }
			title={ translate( 'Marketplace' ) }
			description={ translate(
				'Choose from a variety of hosting, or à la carte products for your sites.'
			) }
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
