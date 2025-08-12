import page from '@automattic/calypso-router';
import { Badge } from '@automattic/components';
import { chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { A4A_REPORTS_LINK } from 'calypso/a8c-for-agencies/sections/reports/constants';
import Sidebar from '../sidebar';
import useReportsMenuItems from './hooks/use-reports-menu-items';
import { A4A_OVERVIEW_LINK } from './lib/constants';

type Props = {
	path: string;
};

export default function ReportsSidebar( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = useReportsMenuItems( path );

	return (
		<Sidebar
			path={ A4A_REPORTS_LINK }
			title={
				<div className="sidebar-menu-item__title-with-badge">
					<span>{ translate( 'Reports' ) }</span>
					<Badge type="info">{ translate( 'Beta' ) }</Badge>
				</div>
			}
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
