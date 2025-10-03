import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import PagePlaceholder from 'calypso/a8c-for-agencies/components/page-placeholder';
import {
	A4A_WOOPAYMENTS_DASHBOARD_LINK,
	A4A_WOOPAYMENTS_OVERVIEW_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchAllLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-all-licenses';
import {
	LicenseFilter,
	LicenseSortField,
	LicenseSortDirection,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';

const WooPaymentsLanding = () => {
	const translate = useTranslate();
	const title = translate( 'WooPayments commissions' );

	const { data: licensesWithWooPayments, isFetched } = useFetchAllLicenses(
		LicenseFilter.Attached,
		'woopayments',
		LicenseSortField.IssuedAt,
		LicenseSortDirection.Descending
	);

	useEffect( () => {
		if ( ! isFetched ) {
			return;
		}
		if ( licensesWithWooPayments?.items?.length ) {
			page.redirect( A4A_WOOPAYMENTS_DASHBOARD_LINK );
			return;
		}
		page.redirect( A4A_WOOPAYMENTS_OVERVIEW_LINK );
	}, [ licensesWithWooPayments, isFetched ] );

	return <PagePlaceholder title={ title } />;
};

export default WooPaymentsLanding;
