/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import TierOverviewCard from '../tier-overview-card';

const props = {
	tierId: 'pro-agency-partner' as const,
	influencedRevenue: 0,
	tiersHref: '/agency/tiers',
	shouldUseRouterLink: false,
	onScheduleCall: jest.fn(),
};

describe( '<TierOverviewCard>', () => {
	test( 'names the assigned partner manager next to the check-in', () => {
		render(
			<TierOverviewCard
				{ ...props }
				partnerManager={ { name: 'Katie Smith', avatar_url: 'https://example.com/katie.png' } }
			/>
		);

		expect( screen.getByText( 'Katie Smith' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Schedule a check-in' } ) ).toBeVisible();
	} );

	test( 'keeps the generic copy when no partner manager is assigned', () => {
		render( <TierOverviewCard { ...props } partnerManager={ null } /> );

		expect(
			screen.getByText( 'Get strategic guidance from your dedicated partner manager.' )
		).toBeVisible();
		expect( screen.queryByText( 'Katie Smith' ) ).not.toBeInTheDocument();
	} );
} );
