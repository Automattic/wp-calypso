import { Badge } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { A4A_REPORTS_LINK } from 'calypso/a8c-for-agencies/sections/reports/constants';
import Sidebar from '../sidebar';
import useBackToOverviewButtonProps from './hooks/use-back-to-overview-button-props';
import useReportsMenuItems from './hooks/use-reports-menu-items';

type Props = {
	path: string;
};

export default function ReportsSidebar( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = useReportsMenuItems( path );
	const backButtonProps = useBackToOverviewButtonProps();

	return (
		<Sidebar
			path={ A4A_REPORTS_LINK }
			title={
				<div className="sidebar-menu-item__title-with-badge">
					<span>{ translate( 'Reports' ) }</span>
					<Badge intent="draft">{ translate( 'Beta' ) }</Badge>
				</div>
			}
			backButtonProps={ backButtonProps }
			menuItems={ menuItems }
			withUserProfileFooter
		/>
	);
}
