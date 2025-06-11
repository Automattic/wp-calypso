import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import {
	DATAVIEWS_TABLE,
	initialDataViewsState,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import { PageBodyPlaceholder } from 'calypso/a8c-for-agencies/components/page-placeholder';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutColumn from 'calypso/layout/hosting-dashboard/column';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { A4A_REPORTS_BUILD_LINK } from '../../constants';
import useFetchReports from '../../hooks/use-fetch-reports';
import { getSiteReports } from '../../lib/get-site-reports';
import ReportsDetails from '../../reports-details';
import ReportsDashboardEmptyState from './empty-state';
import ReportsList from './reports-list';
import type { SiteReports } from '../../types';

import './style.scss';

export default function ReportsDashboard() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isDesktop = useDesktopBreakpoint();
	const title = translate( 'Reports Dashboard' );

	const { data: reports, isLoading } = useFetchReports();

	const showEmptyState = ! isLoading && ( ! reports || reports.length === 0 );

	const siteReports = useMemo( () => {
		return getSiteReports( reports );
	}, [ reports ] );

	const handleBuildNewReport = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_reports_build_new_report_click' ) );
	};

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'site', 'reportCount', 'latestStatus', 'dateSent' ],
	} );

	// To ensure the selected item is updated when the reports list is updated
	// as we optimistically update the reports list
	const selectedItem = useMemo(
		() =>
			dataViewsState.selectedItem &&
			siteReports?.find(
				( report: SiteReports ) => report.site === dataViewsState.selectedItem?.site
			),
		[ dataViewsState.selectedItem, siteReports ]
	);

	const updatedDataViewsState = useMemo( () => {
		return {
			...dataViewsState,
			selectedItem,
		};
	}, [ dataViewsState, selectedItem ] );

	const content = useMemo( () => {
		if ( isLoading ) {
			return <PageBodyPlaceholder />;
		}

		if ( showEmptyState ) {
			return <ReportsDashboardEmptyState />;
		}

		return (
			<ReportsList
				siteReports={ siteReports }
				dataViewsState={ updatedDataViewsState }
				setDataViewsState={ setDataViewsState }
			/>
		);
	}, [ isLoading, showEmptyState, siteReports, updatedDataViewsState, setDataViewsState ] );

	const isFullWidth = ! showEmptyState && isDesktop && ! isLoading;

	return (
		<Layout
			className={ clsx( 'reports-dashboard', {
				'is-empty': showEmptyState,
				'full-width-layout-with-table': isFullWidth,
				'reports-dashboard--has-selected': selectedItem,
			} ) }
			title={ title }
			wide
		>
			<LayoutColumn wide className="reports-dashboard__column">
				<LayoutTop isFullWidth={ isFullWidth }>
					<LayoutHeader>
						<Title>{ title }</Title>
						<Actions>
							<MobileSidebarNavigation />
							<div className="reports-dashboard__actions">
								{ ! isLoading && ! showEmptyState && (
									<Button
										variant="primary"
										onClick={ handleBuildNewReport }
										href={ A4A_REPORTS_BUILD_LINK }
									>
										{ translate( 'Build a new report' ) }
									</Button>
								) }
							</div>
						</Actions>
					</LayoutHeader>
				</LayoutTop>
				<LayoutBody>{ content }</LayoutBody>
			</LayoutColumn>
			{ selectedItem && (
				<LayoutColumn wide>
					<ReportsDetails
						siteReports={ selectedItem }
						closeSitePreviewPane={ () =>
							setDataViewsState( ( prevState ) => ( {
								...prevState,
								type: DATAVIEWS_TABLE,
								selectedItem: null,
							} ) )
						}
					/>
				</LayoutColumn>
			) }
		</Layout>
	);
}
