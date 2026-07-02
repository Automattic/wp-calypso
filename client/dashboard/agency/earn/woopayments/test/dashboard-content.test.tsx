/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import WooPaymentsDashboardContent from '../dashboard-content';
import type { useWooPaymentsDashboardData } from '../use-woopayments-dashboard-data';
import type { AgencyWooPaymentsData, AgencyWooPaymentsSiteState } from '@automattic/api-core';

type DashboardData = ReturnType< typeof useWooPaymentsDashboardData >;

const emptyData: DashboardData = {
	sites: [],
	isLoading: false,
	hasSites: false,
	commissions: undefined,
	isLoadingCommissions: false,
};

const site: AgencyWooPaymentsSiteState = {
	blogId: 1,
	siteUrl: 'https://example.com',
	state: 'active',
};

const commissions: AgencyWooPaymentsData = {
	status: 'complete',
	data: {
		total: {
			payout: 100,
			tpv: 1000,
			transactions: 5,
			sites: { 1: { payout: 100, tpv: 1000, transactions: 5 } },
		},
		estimated: {
			payout: 0,
			tpv: 0,
			transactions: 0,
			current_quarter: { payout: 0, tpv: 0, transactions: 0 },
			previous_quarter: { payout: 0, tpv: 0, transactions: 0 },
		},
		commission_eligible_sites: [ 1 ],
	},
};

describe( '<WooPaymentsDashboardContent>', () => {
	test( 'shows the empty state when there are no sites', () => {
		render( <WooPaymentsDashboardContent data={ emptyData } agencyId={ 7 } /> );

		expect( screen.getByText( /Earn Revenue Share/i ) ).toBeVisible();
	} );

	test( 'renders the sites table when there are sites', () => {
		const data: DashboardData = {
			sites: [ site ],
			isLoading: false,
			hasSites: true,
			commissions,
			isLoadingCommissions: false,
		};

		render( <WooPaymentsDashboardContent data={ data } agencyId={ 7 } /> );

		expect( screen.getByRole( 'table' ) ).toBeVisible();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
	} );
} );
