/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import {
	useIsPostPlanSelectionEmailVerification,
	useIsEmailVerificationEnabled,
	useEmailVerificationGate,
} from '../use-email-verification-gate';

jest.mock( 'calypso/lib/explat', () => ( { useExperiment: jest.fn() } ) );
jest.mock( 'calypso/state', () => ( { useSelector: jest.fn() } ) );

const mockUseExperiment = useExperiment as jest.Mock;
const mockUser = ( user: object | null ) =>
	( useSelector as unknown as jest.Mock ).mockReturnValue( user );

// Mirrors ExPlat: an ineligible call yields no assignment, so only onboarding gets an arm.
const assign = (
	variationName: string | null,
	{ isLoading = false }: { isLoading?: boolean } = {}
) =>
	mockUseExperiment.mockImplementation( ( _name: string, opts?: { isEligible?: boolean } ) =>
		opts?.isEligible ? [ isLoading, variationName ? { variationName } : null ] : [ false, null ]
	);

const statusFor = ( flow = 'onboarding' ) =>
	renderHook( () => useEmailVerificationGate( flow ) ).result.current.status;

describe( 'useEmailVerificationGate', () => {
	beforeEach( () => assign( 'treatment_post_account_creation' ) );
	afterEach( () => jest.clearAllMocks() );

	it( 'gates an unverified email account', () => {
		mockUser( { email_verified: false } );

		expect( statusFor() ).toBe( 'gated' );
	} );

	// Which is the whole of what keeps social signups out: they are created already verified.
	it( 'clears a verified account', () => {
		mockUser( { email_verified: true } );

		expect( statusFor() ).toBe( 'verified' );
	} );

	// Its address was generated for it, so there is no link in an inbox for the gate to point at.
	it( 'clears an unverified phone account', () => {
		mockUser( { email_verified: false, phone_account: true } );

		expect( statusFor() ).toBe( 'clear' );
	} );

	// The user's ID survives a reload but the user object does not, so being logged in is not the
	// same as knowing anything. Reading the absent fields as unverified opens the gate on nobody.
	it( 'waits rather than guessing while the user object is missing', () => {
		mockUser( null );

		expect( statusFor() ).toBe( 'pending' );
	} );

	// Deciding the gate on a not-yet-loaded assignment would advance a would-be-gated account.
	it( 'holds rather than clears while the assignment is loading', () => {
		assign( 'treatment_post_account_creation', { isLoading: true } );
		mockUser( { email_verified: false } );

		expect( statusFor() ).toBe( 'pending' );
	} );

	it( 'clears every flow but onboarding', () => {
		mockUser( { email_verified: false } );

		expect( statusFor( 'newsletter' ) ).toBe( 'clear' );
	} );

	describe( 'under the control arm', () => {
		beforeEach( () => assign( 'control' ) );

		it( 'clears an unverified account rather than gating it', () => {
			mockUser( { email_verified: false } );

			expect( statusFor() ).toBe( 'clear' );
		} );

		// Not `clear`: a control assignment is not the user having confirmed, and treating it as one
		// would record a confirmation and spend the attempt that a real one needed.
		it( 'still reports a verified account as verified', () => {
			mockUser( { email_verified: true } );

			expect( statusFor() ).toBe( 'verified' );
		} );
	} );

	// The post-plan-selection arm (Variant B) must not open the account-step gate: it moves later.
	it( 'does not gate the account step under the post-plan-selection arm', () => {
		assign( 'treatment_post_plan_selection' );
		mockUser( { email_verified: false } );

		expect( statusFor() ).toBe( 'clear' );
	} );
} );

describe( 'useIsPostPlanSelectionEmailVerification', () => {
	afterEach( () => jest.clearAllMocks() );

	const deferredFor = ( flow = 'onboarding' ) =>
		renderHook( () => useIsPostPlanSelectionEmailVerification( flow ) ).result.current;

	it( 'is true for onboarding under the post-plan-selection arm', () => {
		assign( 'treatment_post_plan_selection' );

		expect( deferredFor() ).toBe( true );
	} );

	it( 'is false for other flows', () => {
		assign( 'treatment_post_plan_selection' );

		expect( deferredFor( 'newsletter' ) ).toBe( false );
	} );

	it( 'is false under the account-step arm', () => {
		assign( 'treatment_post_account_creation' );

		expect( deferredFor() ).toBe( false );
	} );
} );

describe( 'useIsEmailVerificationEnabled', () => {
	afterEach( () => jest.clearAllMocks() );

	const enabledFor = ( flow = 'onboarding' ) =>
		renderHook( () => useIsEmailVerificationEnabled( flow ) ).result.current;

	// Either treatment sends the activation email and points it back at onboarding.
	it( 'is true under the account-step arm', () => {
		assign( 'treatment_post_account_creation' );

		expect( enabledFor() ).toBe( true );
	} );

	it( 'is true under the post-plan-selection arm', () => {
		assign( 'treatment_post_plan_selection' );

		expect( enabledFor() ).toBe( true );
	} );

	it( 'is false under the control arm', () => {
		assign( 'control' );

		expect( enabledFor() ).toBe( false );
	} );

	it( 'is false for other flows', () => {
		assign( 'treatment_post_account_creation' );

		expect( enabledFor( 'newsletter' ) ).toBe( false );
	} );
} );
