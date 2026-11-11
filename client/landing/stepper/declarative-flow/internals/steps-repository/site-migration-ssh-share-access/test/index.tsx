/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import wp from 'calypso/lib/wp';
import SiteMigrationSshShareAccess from '..';
import { mockStepProps, renderStep } from '../../test/helpers';
import type { StepProps } from '../../../types';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
		post: jest.fn(),
	},
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/landing/stepper/hooks/use-site-slug-param' );

const render = ( props?: Partial< StepProps > ) =>
	renderStep( <SiteMigrationSshShareAccess { ...mockStepProps( props ) } />, {
		initialEntry:
			'/site-migration-ssh-share-access?siteId=123&from=example.com&host=bluehost&transferId=456',
	} );

const askForHelp = () => screen.getByRole( 'button', { name: 'Let us migrate your site' } );

describe( 'SiteMigrationSshShareAccess', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest
			.mocked( useSite )
			.mockReturnValue( { ID: 123, name: 'Example' } as ReturnType< typeof useSite > );
		jest.mocked( useSiteSlugParam ).mockReturnValue( 'example.wordpress.com' );
		jest.mocked( wp.req.get ).mockReturnValue( new Promise( () => {} ) );
	} );

	it( 'tells the customer our team will reach out when wpcom refused the migration request', async () => {
		const submit = jest.fn();
		jest
			.mocked( wp.req.post )
			.mockImplementation( ( params: { path?: string } ) =>
				params?.path === '/help/migration-ticket/new'
					? Promise.reject( { code: 'migration_request_not_submitted' } )
					: Promise.resolve( {} )
			);

		render( { navigation: { submit } } );
		await userEvent.click( askForHelp() );

		expect(
			await screen.findByText(
				'We couldn’t submit your migration request automatically. Our team has been notified and will reach out by email.'
			)
		).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
		// Only the ticket was requested: the status isn't moved to DIFM without a ticket.
		expect( wp.req.post ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'hands the migration to our team when the request is sent', async () => {
		const submit = jest.fn();
		jest.mocked( wp.req.post ).mockResolvedValue( { success: true } );

		render( { navigation: { submit } } );
		await userEvent.click( askForHelp() );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { destination: 'do-it-for-me' } ) );
	} );
} );
