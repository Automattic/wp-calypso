/**
 * @jest-environment jsdom
 */

import { isSupportSession } from '@automattic/calypso-support-session';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
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
	select( noticesStore )
		.getNotices()
		.forEach( ( notice ) => dispatch( noticesStore ).removeNotice( notice.id ) );
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

	test( 'shows no state and points to the User Report Card inside a support session', async () => {
		( isSupportSession as jest.Mock ).mockReturnValue( true );
		mockUserSettings( { two_step_enabled: false } );

		render( <SecurityTwoStepAuthSummary /> );

		expect( await screen.findByText( 'Not available during a support session' ) ).toBeVisible();
		expect( screen.queryByText( 'Enabled' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Not enabled' ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByText( 'Two-step authentication' ) );

		expect( select( noticesStore ).getNotices() ).toEqual( [
			expect.objectContaining( {
				status: 'error',
				type: 'snackbar',
				content:
					'Two-step authentication status is not available during a support session. Use the User Report Card for the full configuration.',
			} ),
		] );
	} );
} );
