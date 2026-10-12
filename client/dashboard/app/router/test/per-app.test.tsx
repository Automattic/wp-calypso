/**
 * @jest-environment jsdom
 */

import { isNotFound } from '@tanstack/react-router';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import { APP_CONTEXT_DEFAULT_CONFIG, type AppConfig } from '../../context';
import { perApp, perAppComponent, requireSupport } from '../per-app';

const configFor = ( app: AppConfig[ 'app' ] ): AppConfig => ( {
	...APP_CONTEXT_DEFAULT_CONFIG,
	app,
} );

function thrown( fn: () => void ) {
	try {
		fn();
	} catch ( error ) {
		return error;
	}
}

describe( 'perApp', () => {
	test( 'runs the variant for the current app', () => {
		const variants = { dotcom: () => 'dotcom', a4a: () => 'a4a' };

		expect( perApp( configFor( 'a4a' ), variants ) ).toBe( 'a4a' );
		expect( perApp( configFor( 'dotcom' ), variants ) ).toBe( 'dotcom' );
	} );

	test( 'falls back to dotcom for CIAB', () => {
		expect( perApp( configFor( 'ciab' ), { dotcom: () => 'dotcom' } ) ).toBe( 'dotcom' );
		expect( perApp( configFor( 'ciab' ), { dotcom: () => 'dotcom', ciab: () => 'ciab' } ) ).toBe(
			'ciab'
		);
	} );
} );

describe( 'perAppComponent', () => {
	const Screen = perAppComponent( {
		dotcom: () => <p>Dotcom screen</p>,
		a4a: () => <p>Agency screen</p>,
	} );

	test( 'renders the component for the current app', () => {
		render( <Screen />, { config: configFor( 'a4a' ) } );

		expect( screen.getByText( 'Agency screen' ) ).toBeVisible();
	} );

	test( 'renders the dotcom component for CIAB', () => {
		render( <Screen />, { config: configFor( 'ciab' ) } );

		expect( screen.getByText( 'Dotcom screen' ) ).toBeVisible();
	} );
} );

describe( 'requireSupport', () => {
	test( 'throws not-found when the app lacks support', () => {
		const config = {
			...configFor( 'a4a' ),
			supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, domains: false },
		};

		expect( isNotFound( thrown( () => requireSupport( config, 'domains' ) ) ) ).toBe( true );
	} );

	test( 'passes when the app supports it', () => {
		const config = {
			...configFor( 'dotcom' ),
			supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, domains: true },
		};

		expect( thrown( () => requireSupport( config, 'domains' ) ) ).toBeUndefined();
	} );
} );
