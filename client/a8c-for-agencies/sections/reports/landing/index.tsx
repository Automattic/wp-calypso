import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import PagePlaceholder from 'calypso/a8c-for-agencies/components/page-placeholder';
import { A4A_REPORTS_OVERVIEW_LINK } from '../constants';

const ReportsLanding = () => {
	const translate = useTranslate();
	const title = translate( 'Reports' );

	useEffect( () => {
		// For now, always redirect to overview
		// TODO: Implement logic to determine which page to redirect to
		page.redirect( A4A_REPORTS_OVERVIEW_LINK );
	}, [] );

	return <PagePlaceholder title={ title } />;
};

export default ReportsLanding;
