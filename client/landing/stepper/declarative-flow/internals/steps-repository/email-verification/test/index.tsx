/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import EmailVerificationStep from '../index';

let mockState = { userId: 7, email: 'person@example.com', verified: false };
let mockQuery = new URLSearchParams();

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( mockState ),
} ) );

jest.mock( '../../../../../hooks/use-query', () => ( { useQuery: () => mockQuery } ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserId: ( state: { userId: number } ) => state.userId,
	getCurrentUserEmail: ( state: { email: string } ) => state.email,
	isCurrentUserEmailVerified: ( state: { verified: boolean } ) => state.verified,
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	Step: { Loading: () => <div data-testid="loading" /> },
} ) );

jest.mock( 'calypso/lib/partner-branding', () => ( {
	usePartnerBranding: () => ( { topBarLogo: null } ),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

const mockGateProps = jest.fn();
jest.mock( '../../__user/email-verification', () => ( props: Record< string, unknown > ) => {
	mockGateProps( props );
	return <div data-testid="gate" />;
} );

jest.mock( '../../__user/email-verification/storage', () => ( {
	gateScope: ( flow: string, userId: number ) => `${ flow }:${ userId }`,
	claimGateConfirmation: jest.fn( () => ( { secondsOnStep: 12 } ) ),
} ) );

const mockConfirmationProps = jest.fn();
jest.mock( '../confirmation', () => ( props: Record< string, unknown > ) => {
	mockConfirmationProps( props );
	return <div data-testid="confirmation" />;
} );

const renderStep = ( submit = jest.fn() ) => {
	render(
		<EmailVerificationStep
			flow="onboarding"
			navigation={ { submit } }
			stepName="email-verification"
		/>
	);
	return submit;
};

describe( 'EmailVerificationStep', () => {
	beforeEach( () => {
		mockState = { userId: 7, email: 'person@example.com', verified: false };
		mockQuery = new URLSearchParams();
		jest.clearAllMocks();
	} );

	it( 'shows the gate, without an edit affordance, while the account is unverified', () => {
		const submit = renderStep();

		expect( screen.getByTestId( 'gate' ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();

		const props = mockGateProps.mock.calls[ 0 ][ 0 ];
		expect( props.email ).toBe( 'person@example.com' );
		expect( props.scope ).toBe( 'onboarding:7' );
		expect( props.onEditEmail ).toBeUndefined();
	} );

	it( 'advances the flow and records the confirmation once verified', () => {
		mockState = { ...mockState, verified: true };

		const submit = renderStep();

		expect( submit ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_confirmed',
			expect.objectContaining( { flow: 'onboarding', seconds_on_step: 12 } )
		);
		expect( screen.queryByTestId( 'gate' ) ).not.toBeInTheDocument();
	} );

	it( 'advances only once when the navigation object changes identity on re-render', () => {
		mockState = { ...mockState, verified: true };
		const submit = jest.fn();

		// The flow hands the step a fresh `navigation` object every render, so a re-render must not
		// re-trigger the advance or double-record the confirmation.
		const { rerender } = render(
			<EmailVerificationStep
				flow="onboarding"
				navigation={ { submit } }
				stepName="email-verification"
			/>
		);
		rerender(
			<EmailVerificationStep
				flow="onboarding"
				navigation={ { submit } }
				stepName="email-verification"
			/>
		);

		expect( submit ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );

	describe( 'confirmation-link tab (?confirmed=1)', () => {
		beforeEach( () => {
			mockQuery = new URLSearchParams( 'confirmed=1' );
		} );

		it( 'shows the static confirmation, without the gate', () => {
			renderStep();

			expect( screen.getByTestId( 'confirmation' ) ).toBeVisible();
			expect( screen.queryByTestId( 'gate' ) ).not.toBeInTheDocument();
		} );

		it( 'never advances or records a confirmation, even when the account is verified', () => {
			mockState = { ...mockState, verified: true };

			const submit = renderStep();

			expect( screen.getByTestId( 'confirmation' ) ).toBeVisible();
			expect( screen.queryByTestId( 'loading' ) ).not.toBeInTheDocument();
			expect( submit ).not.toHaveBeenCalled();
			expect( recordTracksEvent ).not.toHaveBeenCalled();
		} );

		it( 'restarts the flow from its beginning when the escape hatch is used', () => {
			const assign = jest.fn();
			Object.defineProperty( window, 'location', {
				value: { assign },
				writable: true,
			} );

			renderStep();

			mockConfirmationProps.mock.calls[ 0 ][ 0 ].onContinue();
			expect( assign ).toHaveBeenCalledWith( '/setup/onboarding' );
		} );
	} );
} );
