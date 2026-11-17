/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import GrowthCard from '../growth-card';
import type { AgencyTierType } from '../../tiers/types';

const links = {
	tiers: '/tiers',
	sites: '/sites',
	referrals: '/referrals',
	woopayments: '/woopayments',
	marketplace: '/marketplace',
	partnerDirectory: '/partner-directory',
};

function renderGrowthCard( tierId: AgencyTierType ) {
	render( <GrowthCard tierId={ tierId } links={ links } shouldUseRouterLink={ false } /> );
}

describe( '<GrowthCard>', () => {
	test.each( [
		[ 'emerging-partner', 'Grow toward Agency Partner' ],
		[ 'agency-partner', 'Grow toward Pro Partner' ],
		[ 'pro-agency-partner', 'Grow toward VIP Pro Agency Partner' ],
		[ 'vip-pro-agency-partner', 'Grow toward Premier Partner' ],
		[ 'premier-partner', 'Get the most from Premier' ],
	] as const )( 'points %s at the next tier', ( tierId, heading ) => {
		renderGrowthCard( tierId );

		expect( screen.getByRole( 'heading', { name: heading } ) ).toBeVisible();
	} );

	test( 'gives Pro the VIP Pro target', () => {
		renderGrowthCard( 'pro-agency-partner' );

		expect( screen.getByText( /Reach \$100,000 IAR to qualify for VIP Pro/ ) ).toBeVisible();
	} );

	test( 'gives VIP Pro the Premier target', () => {
		renderGrowthCard( 'vip-pro-agency-partner' );

		expect(
			screen.getByText( /Reach \$250,000 IAR to qualify for Premier Partner/ )
		).toBeVisible();
	} );
} );
