import { jetpackAgencyLicensesQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import PagePlaceholder from 'calypso/a8c-for-agencies/components/page-placeholder';
import {
	A4A_WOOPAYMENTS_DASHBOARD_LINK,
	A4A_WOOPAYMENTS_OVERVIEW_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import {
	LicenseFilter,
	LicenseSortField,
	LicenseSortDirection,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

const WooPaymentsLanding = () => {
	const translate = useTranslate();
	const title = translate( 'WooPayments commissions' );

	const agencyId = useSelector( getActiveAgencyId );

	const { data: licenses, isFetched } = useQuery( {
		...jetpackAgencyLicensesQuery( agencyId ?? 0, {
			filter: LicenseFilter.Attached,
			search: 'woopayments',
			sortField: LicenseSortField.IssuedAt,
			sortDirection: LicenseSortDirection.Descending,
		} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );

	useEffect( () => {
		if ( ! isFetched ) {
			return;
		}
		if ( licenses?.length ) {
			page.redirect( A4A_WOOPAYMENTS_DASHBOARD_LINK );
			return;
		}
		page.redirect( A4A_WOOPAYMENTS_OVERVIEW_LINK );
	}, [ licenses, isFetched ] );

	return <PagePlaceholder title={ title } />;
};

export default WooPaymentsLanding;
