/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import EmailVerificationStep from '../index';

let mockState = { userId: 7, email: 'person@example.com', verified: false };

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( mockState ),
} ) );

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

const renderStep = ( submit = jest.fn() ) => {
	render(
		// @ts-expect-error -- only the props the step reads are provided.
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
} );
