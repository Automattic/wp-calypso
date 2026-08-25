/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import {
	useIsPostPlanSelectionEmailVerification,
	useIsPostAccountCreationEmailVerification,
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

const variantLoadingFor = ( flow = 'onboarding' ) =>
	renderHook( () => useEmailVerificationGate( flow ) ).result.current.isVariantLoading;

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

	// The arm check sits above the phone-account check, so Variant B clears a phone account without
	// ever reaching it. Reordering the two would gate phone accounts under Variant B — this pins it.
	it( 'clears a phone account under the post-plan-selection arm', () => {
		assign( 'treatment_post_plan_selection' );
		mockUser( { email_verified: false, phone_account: true } );

		expect( statusFor() ).toBe( 'clear' );
	} );

	// The account step holds the passwordless submit on this, so a create-account request can't fire
	// with the wrong activation email before the arm resolves.
	describe( 'isVariantLoading', () => {
		it( 'is true while the assignment is loading', () => {
			assign( 'treatment_post_account_creation', { isLoading: true } );
			mockUser( null );

			expect( variantLoadingFor() ).toBe( true );
		} );

		it( 'is false once the assignment resolves', () => {
			mockUser( { email_verified: false } );

			expect( variantLoadingFor() ).toBe( false );
		} );

		// An ineligible flow never fetches, so nothing is ever held on it.
		it( 'is false for other flows', () => {
			assign( 'treatment_post_account_creation', { isLoading: true } );
			mockUser( null );

			expect( variantLoadingFor( 'newsletter' ) ).toBe( false );
		} );
	} );
} );

describe( 'useIsPostPlanSelectionEmailVerification', () => {
	afterEach( () => jest.clearAllMocks() );

	const postPlanSelectionFor = ( flow = 'onboarding' ) =>
		renderHook( () => useIsPostPlanSelectionEmailVerification( flow ) ).result.current;

	it( 'is true for onboarding under the post-plan-selection arm', () => {
		assign( 'treatment_post_plan_selection' );

		expect( postPlanSelectionFor() ).toBe( true );
	} );

	it( 'is false for other flows', () => {
		assign( 'treatment_post_plan_selection' );

		expect( postPlanSelectionFor( 'newsletter' ) ).toBe( false );
	} );

	it( 'is false under the account-step arm', () => {
		assign( 'treatment_post_account_creation' );

		expect( postPlanSelectionFor() ).toBe( false );
	} );

	// While the assignment loads the arm is unknown, so it must read as control (false) — this is
	// what makes the flow route as control mid-load rather than guessing the post-plan-selection gate.
	it( 'is false while the assignment is loading', () => {
		assign( 'treatment_post_plan_selection', { isLoading: true } );

		expect( postPlanSelectionFor() ).toBe( false );
	} );
} );

describe( 'useIsPostAccountCreationEmailVerification', () => {
	afterEach( () => jest.clearAllMocks() );

	const accountCreationFor = ( flow = 'onboarding' ) =>
		renderHook( () => useIsPostAccountCreationEmailVerification( flow ) ).result.current;

	it( 'is true for onboarding under the account-step arm', () => {
		assign( 'treatment_post_account_creation' );

		expect( accountCreationFor() ).toBe( true );
	} );

	it( 'is false for other flows', () => {
		assign( 'treatment_post_account_creation' );

		expect( accountCreationFor( 'newsletter' ) ).toBe( false );
	} );

	it( 'is false under the post-plan-selection arm', () => {
		assign( 'treatment_post_plan_selection' );

		expect( accountCreationFor() ).toBe( false );
	} );

	// Loading reads as control (false), so the account step doesn't gate on a not-yet-known arm.
	it( 'is false while the assignment is loading', () => {
		assign( 'treatment_post_account_creation', { isLoading: true } );

		expect( accountCreationFor() ).toBe( false );
	} );
} );
