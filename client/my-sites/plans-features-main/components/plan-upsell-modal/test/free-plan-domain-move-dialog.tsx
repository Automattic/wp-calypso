/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import { FreePlanDomainMoveDialog } from '../free-plan-domain-move-dialog';

vi.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: vi.fn(),
} ) );

vi.mock( '../components/plan-upsell-button', () => ( { default: () => <div /> } ) );

describe( 'FreePlanDomainMoveDialog', () => {
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

	test( 'offers no free domain year and keeps the moved domain on the Free plan', async () => {
		renderWithProvider( <FreePlanDomainMoveDialog { ...defaultProps } /> );

		expect( screen.queryByText( /Free for one year/ ) ).toBeNull();

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue with Free plan' } ) );
		expect( defaultProps.onFreePlanSelected ).toHaveBeenCalledWith( true );
	} );
} );
