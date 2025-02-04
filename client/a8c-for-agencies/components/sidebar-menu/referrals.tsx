import page from '@automattic/calypso-router';
import { chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Sidebar from '../sidebar';
import useReferralsMenuItems from './hooks/use-referrals-menu-items';
import { A4A_OVERVIEW_LINK, A4A_REFERRALS_LINK } from './lib/constants';

type Props = {
	path: string;
};

export default function ( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = useReferralsMenuItems( path );

	return (
		<Sidebar
			path={ A4A_REFERRALS_LINK }
			title={ translate( 'Referrals' ) }
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
