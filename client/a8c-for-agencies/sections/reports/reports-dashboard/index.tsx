import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_REPORTS_BUILD_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import ReportsList from '../reports-list';
import './style.scss';

export default function ReportsDashboard() {
	const translate = useTranslate();
	const pageTitle = translate( 'Reports Dashboard' );
	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'siteNameOrUrl', 'dateSent', 'status' ],
	} );

	return (
		<Layout title={ pageTitle } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ pageTitle }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<Button variant="primary" href={ A4A_REPORTS_BUILD_LINK }>
							{ translate( 'Build a new report' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody className="reports-dashboard-content">
				<ReportsList
					reports={ [] }
					dataViewsState={ dataViewsState }
					setDataViewsState={ setDataViewsState }
				/>
			</LayoutBody>
		</Layout>
	);
}
