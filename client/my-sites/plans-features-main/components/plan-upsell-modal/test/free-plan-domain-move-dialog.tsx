/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import { FreePlanDomainMoveDialog } from '../free-plan-domain-move-dialog';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '../components/plan-upsell-button', () => () => <div /> );

describe( 'FreePlanDomainMoveDialog', () => {
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

	test( 'offers no free domain year and keeps the moved domain on the Free plan', async () => {
		renderWithProvider( <FreePlanDomainMoveDialog { ...defaultProps } /> );

		expect( screen.queryByText( /Free for one year/ ) ).toBeNull();

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue with Free plan' } ) );
		expect( defaultProps.onFreePlanSelected ).toHaveBeenCalledWith( true );
	} );
} );
