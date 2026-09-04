/**
 * @jest-environment jsdom
 */
import AsyncLoad from 'calypso/components/async-load';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderOnboardingGate from '../gate';
import type { ReactElement } from 'react';

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

	it( 'loads reader onboarding for a logged-in user', () => {
		render( <ReaderOnboardingGate /> );

		const [ props ] = ( AsyncLoad as jest.Mock ).mock.calls[ 0 ];
		expect( typeof props.require ).toBe( 'function' );
		expect( props.require.toString() ).toContain( 'calypso/reader/onboarding-rsm' );
	} );

	it( 'forwards props to AsyncLoad', () => {
		const onRender = jest.fn();

		render( <ReaderOnboardingGate onRender={ onRender } isSuppressed /> );

		const [ props ] = ( AsyncLoad as jest.Mock ).mock.calls[ 0 ];
		expect( props ).toMatchObject( {
			onRender,
			isSuppressed: true,
		} );
	} );

	it( 'renders nothing when the user is logged out', () => {
		render( <ReaderOnboardingGate />, loggedOutState );

		expect( AsyncLoad as jest.Mock ).not.toHaveBeenCalled();
	} );
} );
