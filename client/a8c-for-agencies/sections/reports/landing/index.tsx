import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import PagePlaceholder from 'calypso/a8c-for-agencies/components/page-placeholder';
import { A4A_REPORTS_DASHBOARD_LINK, A4A_REPORTS_OVERVIEW_LINK } from '../constants';
import useFetchReports from '../hooks/use-fetch-reports';

const ReportsLanding = () => {
	const translate = useTranslate();
	const title = translate( 'Reports' );

	const { data: reports, isFetched } = useFetchReports();

	useEffect( () => {
		if ( ! isFetched ) {
			return;
		}
		if ( reports?.length ) {
			page.redirect( A4A_REPORTS_DASHBOARD_LINK );
			return;
		}
		page.redirect( A4A_REPORTS_OVERVIEW_LINK );
	}, [ reports, isFetched ] );

	return <PagePlaceholder title={ title } />;
};

export default ReportsLanding;
