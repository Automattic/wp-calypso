/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import AsyncLoad from 'calypso/components/async-load';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderOnboardingGate from '../gate';
import type { ReactElement } from 'react';

jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn();
	const isEnabledMock = jest.fn();
	return {
		__esModule: true,
		default: Object.assign( config, { isEnabled: isEnabledMock } ),
		isEnabled: isEnabledMock,
	};
} );

jest.mock( 'calypso/components/async-load', () => ( {
	__esModule: true,
	default: jest.fn( () => null ),
} ) );

type TestState = { currentUser: { id: number | null } };

const loggedInState: TestState = { currentUser: { id: 12345 } };
const loggedOutState: TestState = { currentUser: { id: null } };

const render = ( ui: ReactElement, initialState: TestState = loggedInState ) =>
	renderWithProvider( ui, { initialState } );

describe( 'ReaderOnboardingGate', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'loads onboarding-rsm when the feature flag is enabled', () => {
		( isEnabled as jest.Mock ).mockReturnValue( true );
		render( <ReaderOnboardingGate /> );

		const [ props ] = ( AsyncLoad as jest.Mock ).mock.calls[ 0 ];
		expect( typeof props.require ).toBe( 'function' );
		expect( props.require.toString() ).toContain( 'calypso/reader/onboarding-rsm' );
	} );

	it( 'loads legacy onboarding when the feature flag is disabled', () => {
		( isEnabled as jest.Mock ).mockReturnValue( false );

		render( <ReaderOnboardingGate /> );

		const [ props ] = ( AsyncLoad as jest.Mock ).mock.calls[ 0 ];
		expect( typeof props.require ).toBe( 'function' );
		expect( props.require.toString() ).toContain( 'calypso/reader/onboarding' );
	} );

	it( 'forwards props to AsyncLoad', () => {
		( isEnabled as jest.Mock ).mockReturnValue( true );
		const onRender = jest.fn();

		render( <ReaderOnboardingGate onRender={ onRender } isSuppressed /> );

		const [ props ] = ( AsyncLoad as jest.Mock ).mock.calls[ 0 ];
		expect( props ).toMatchObject( {
			onRender,
			isSuppressed: true,
		} );
	} );

	it( 'renders nothing when the user is logged out', () => {
		( isEnabled as jest.Mock ).mockReturnValue( true );

		render( <ReaderOnboardingGate />, loggedOutState );

		expect( AsyncLoad as jest.Mock ).not.toHaveBeenCalled();
	} );
} );
