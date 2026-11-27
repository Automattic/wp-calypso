/** @vitest-environment jsdom */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../../../test-utils';
import { ConfirmNewOwnerForm } from '../index';
import type { Site } from '@automattic/api-core';

const site = { ID: 123, slug: 'example.wordpress.com' } as Site;

describe( '<ConfirmNewOwnerForm>', () => {
	test( 'keeps Continue disabled until the eligibility check finishes', async () => {
		let finishCheck = () => {};
		const checked = new Promise< void >( ( resolve ) => ( finishCheck = resolve ) );
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/123/site-owner-transfer/eligibility' )
			.query( true )
			.reply( async () => {
				await checked;
				return [ 200, {} ];
			} );
		const onSubmit = vi.fn();

		render( <ConfirmNewOwnerForm site={ site } newOwnerEmail="" onSubmit={ onSubmit } /> );
		await userEvent.type( screen.getByRole( 'textbox', { name: /Email/ } ), 'new@example.com' );

		const button = screen.getByRole( 'button', { name: 'Continue' } );
		await waitFor( () => expect( nock.pendingMocks() ).toHaveLength( 0 ) );
		expect( button ).toBeDisabled();

		finishCheck();
		await waitFor( () => expect( button ).toBeEnabled() );
		await userEvent.click( button );
		expect( onSubmit ).toHaveBeenCalledWith( { email: 'new@example.com' } );
	} );
} );
