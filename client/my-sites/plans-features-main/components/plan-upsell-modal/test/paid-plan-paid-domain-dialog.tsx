/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import { PaidPlanPaidDomainDialog } from '../paid-plan-paid-domain-dialog';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '../components/paid-domain-suggested-plan-section', () => () => (
	<div data-testid="suggested-plan-section" />
) );

describe( 'PaidPlanPaidDomainDialog', () => {
	const defaultProps = {
		paidDomainName: 'yourgroovydomain.com',
		generatedWPComSubdomain: {
			isLoading: false,
			result: { domain_name: 'yourgroovysite.wordpress.com' },
		},
		onFreePlanSelected: jest.fn(),
		onPlanSelected: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
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
} );
