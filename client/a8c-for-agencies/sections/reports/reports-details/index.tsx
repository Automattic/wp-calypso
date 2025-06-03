import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import ItemView, { createFeaturePreview } from 'calypso/layout/hosting-dashboard/item-view';
import ReportsMobileView from './mobile-view';
import Reports from './reports';
import type { SiteReports } from '../types';
import type { ItemData } from 'calypso/layout/hosting-dashboard/item-view/types';

import './style.scss';

interface Props {
	siteReports: SiteReports;
	closeSitePreviewPane: () => void;
}

const REPORTS_ID = 'reports';

export default function ReportsDetails( { siteReports, closeSitePreviewPane }: Props ) {
	const translate = useTranslate();

	const [ selectedReportTab, setSelectedReportTab ] = useState( REPORTS_ID );

	const itemData: ItemData = {
		title: siteReports.site,
		subtitle: translate( 'Showing %s report', 'Showing %s reports', {
			count: siteReports.reports.length,
			args: [ siteReports.reports.length ],
		} ),
		withIcon: false,
		hideEnvDataInHeader: true,
	};

	const isDesktop = useDesktopBreakpoint();

	const features = useMemo(
		() => [
			createFeaturePreview(
				REPORTS_ID,
				translate( 'Reports' ),
				true,
				selectedReportTab,
				setSelectedReportTab,
				! isDesktop ? (
					<ReportsMobileView reports={ siteReports.reports } actions={ [] } />
				) : (
					<Reports reports={ siteReports.reports } actions={ [] } />
				)
			),
		],
		[ siteReports.reports, isDesktop, selectedReportTab, translate ]
	);

	return (
		<ItemView
			className="reports-details-items"
			itemData={ itemData }
			closeItemView={ closeSitePreviewPane }
			features={ features }
			hideNavIfSingleTab
		/>
	);
}
