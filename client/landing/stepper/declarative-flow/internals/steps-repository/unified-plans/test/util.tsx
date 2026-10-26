// @ts-nocheck - TODO: Fix TypeScript issues
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PLAN_FREE } from '@automattic/calypso-products';
import { buildUpgradeFunction } from '../util';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const getCartItems = ( overrides?: { [ key: string ]: string } ) => [
	{
		product_slug: PLAN_FREE,
		...overrides,
	},
];

describe( 'buildUpgradeFunction', () => {
	const tplProps = {
		flowName: 'onboarding',
		stepName: 'Step name',
		stepSectionName: 'Step section name',
		submitSignupStep: jest.fn(),
		goToNextStep: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'Should call goToNextStep', () => {
		const myProps = {
			...tplProps,
			goToNextStep: jest.fn(),
		};
		const cartItems = getCartItems();
		buildUpgradeFunction( myProps, cartItems );
		expect( myProps.goToNextStep ).toHaveBeenCalled();
	} );

	test( 'Should call submitSignupStep with step details', () => {
		const submitSignupStep = jest.fn();
		const cartItems = getCartItems();
		const myProps = { ...tplProps, submitSignupStep };
		buildUpgradeFunction( myProps, cartItems );
		expect( submitSignupStep ).toHaveBeenCalled();

		const calls = submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ].stepName ).toEqual( 'Step name' );
		expect( args[ 0 ].stepSectionName ).toEqual( 'Step section name' );
		expect( args[ 0 ].cartItems ).toBe( cartItems );
		expect( 'test' in args[ 0 ] ).toEqual( false );
	} );

	test( 'Should call submitSignupStep with additionalStepData if specified', () => {
		const submitSignupStep = jest.fn();
		const myProps = {
			...tplProps,
			additionalStepData: { test: 23 },
			submitSignupStep,
		};
		const cartItems = getCartItems();
		buildUpgradeFunction( myProps, cartItems );
		expect( submitSignupStep ).toHaveBeenCalled();

		const calls = submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ].test ).toEqual( 23 );
	} );

	test( 'Should call submitSignupStep with correct providedDependencies', () => {
		const submitSignupStep = jest.fn();
		const myProps = { ...tplProps, submitSignupStep };
		const cartItems = getCartItems();
		buildUpgradeFunction( myProps, cartItems );
		expect( submitSignupStep ).toHaveBeenCalled();

		const calls = submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 1 ].cartItems ).toBe( cartItems );
	} );

	test( 'Should call recordTracksEvent when cartItem is specified', () => {
		const myProps = { ...tplProps };
		buildUpgradeFunction( myProps, getCartItems( {} ) );
		expect( recordTracksEvent ).toHaveBeenCalled();

		const calls = recordTracksEvent.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ] ).toEqual( 'calypso_signup_plan_select' );
		expect( args[ 1 ] ).toEqual( {
			product_slug: PLAN_FREE,
			from_section: 'Step section name',
		} );
	} );
} );
