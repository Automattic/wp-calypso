import page from '@automattic/calypso-router';
import { chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Sidebar from '../sidebar';
import useReportsMenuItems from './hooks/use-reports-menu-items';
import { A4A_OVERVIEW_LINK, A4A_REPORTS_LINK } from './lib/constants';

type Props = {
	path: string;
};

export default function ReportsSidebar( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = useReportsMenuItems( path );

	return (
		<Sidebar
			path={ A4A_REPORTS_LINK }
			title={ translate( 'Reports' ) }
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
