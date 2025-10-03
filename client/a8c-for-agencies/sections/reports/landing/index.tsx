import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import PagePlaceholder from 'calypso/a8c-for-agencies/components/page-placeholder';
import { A4A_REPORTS_DASHBOARD_LINK, A4A_REPORTS_OVERVIEW_LINK } from '../constants';
import useFetchReports from '../hooks/use-fetch-reports';
import type { Report } from '../types';

const ReportsLanding = () => {
	const translate = useTranslate();
	const title = translate( 'Reports' );

	const { data: reports, isFetched } = useFetchReports();

	const hasSentReports = useMemo( () => {
		return reports?.some( ( report: Report ) => report.status === 'sent' );
	}, [ reports ] );

	useEffect( () => {
		if ( ! isFetched ) {
			return;
		}
		if ( hasSentReports ) {
			page.redirect( A4A_REPORTS_DASHBOARD_LINK );
			return;
		}
		page.redirect( A4A_REPORTS_OVERVIEW_LINK );
	}, [ hasSentReports, isFetched ] );

	return <PagePlaceholder title={ title } />;
};

export default ReportsLanding;
