/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { render } from '@testing-library/react';
import AsyncLoad from 'calypso/components/async-load';
import ReaderOnboardingGate from '../gate';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

jest.mock( 'calypso/components/async-load', () => ( {
	__esModule: true,
	default: jest.fn( () => null ),
} ) );

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
} );
