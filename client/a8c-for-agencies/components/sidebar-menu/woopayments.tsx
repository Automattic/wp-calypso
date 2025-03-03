import page from '@automattic/calypso-router';
import { chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Sidebar from '../sidebar';
import useWooPaymentsMenuItems from './hooks/use-woopayments-menu-items';
import { A4A_OVERVIEW_LINK, A4A_WOOPAYMENTS_LINK } from './lib/constants';

type Props = {
	path: string;
};

export default function ( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = useWooPaymentsMenuItems( path );

	return (
		<Sidebar
			path={ A4A_WOOPAYMENTS_LINK }
			title={ translate( 'WooPayments' ) }
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
