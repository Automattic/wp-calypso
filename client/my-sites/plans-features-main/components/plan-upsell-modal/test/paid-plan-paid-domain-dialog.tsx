/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import { PaidPlanPaidDomainDialog } from '../paid-plan-paid-domain-dialog';

vi.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: vi.fn(),
} ) );

vi.mock( '../components/paid-domain-suggested-plan-section', () => ( {
	default: () => <div data-testid="suggested-plan-section" />,
} ) );

describe( 'PaidPlanPaidDomainDialog', () => {
	const defaultProps = {
		paidDomainName: 'yourgroovydomain.com',
		generatedWPComSubdomain: {
			isLoading: false,
			result: { domain_name: 'yourgroovysite.wordpress.com' },
		},
		onFreePlanSelected: vi.fn(),
		onPlanSelected: vi.fn(),
	};

	beforeEach( () => {
		vi.clearAllMocks();
	} );

	test( 'shows the onboarding copy and drops the domain by default', async () => {
		renderWithProvider( <PaidPlanPaidDomainDialog { ...defaultProps } /> );

		expect( screen.getByText( 'Paid plan required' ) ).toBeVisible();
		expect(
			screen.getByText(
				/Custom domains are only available with a paid plan\. Choose annual billing and receive the domain's first year free\./
			)
		).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue with Free plan' } ) );
		expect( defaultProps.onFreePlanSelected ).toHaveBeenCalledTimes( 1 );
		expect( defaultProps.onFreePlanSelected ).not.toHaveBeenCalledWith( true );
	} );

	test( 'shows the connected domain move copy without the free domain year', () => {
		renderWithProvider( <PaidPlanPaidDomainDialog { ...defaultProps } isConnectedDomainMove /> );

		expect(
			screen.getByText( "To move your connected domain to this site, you'll need a paid plan." )
		).toBeVisible();
		expect( screen.queryByText( /first year free/ ) ).toBeNull();
	} );
} );
