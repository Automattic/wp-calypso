/**
 * @jest-environment jsdom
 */

import { isSupportSession } from '@automattic/calypso-support-session';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import SecurityTwoStepAuthSummary from '../summary';
import type { UserSettings } from '@automattic/api-core';

jest.mock( '@automattic/calypso-support-session', () => ( {
	isSupportSession: jest.fn( () => false ),
} ) );

function mockUserSettings( data: Partial< UserSettings > ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/settings' )
		.query( true )
		.reply( 200, data );
}

afterEach( () => {
	nock.cleanAll();
	( isSupportSession as jest.Mock ).mockReturnValue( false );
} );

describe( '<SecurityTwoStepAuthSummary>', () => {
	test( 'shows "Not enabled" outside a support session when two-step is off', async () => {
		mockUserSettings( { two_step_enabled: false } );

		render( <SecurityTwoStepAuthSummary /> );

		expect( await screen.findByText( 'Not enabled' ) ).toBeVisible();
	} );

	test( 'shows "Enabled" outside a support session when two-step is on', async () => {
		mockUserSettings( { two_step_enabled: true, two_step_backup_codes_printed: true } );

		render( <SecurityTwoStepAuthSummary /> );

		expect( await screen.findByText( 'Enabled' ) ).toBeVisible();
	} );

	test( 'points to the User Report Card instead of a state inside a support session', async () => {
		( isSupportSession as jest.Mock ).mockReturnValue( true );
		mockUserSettings( { two_step_enabled: false } );

		render( <SecurityTwoStepAuthSummary /> );

		expect( await screen.findByText( 'Support session' ) ).toBeVisible();
		expect( screen.getByText( /Use the User Report Card/ ) ).toBeVisible();
		expect( screen.queryByText( 'Enabled' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Not enabled' ) ).not.toBeInTheDocument();
	} );
} );
