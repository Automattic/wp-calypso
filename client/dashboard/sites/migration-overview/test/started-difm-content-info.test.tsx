/**
 * @jest-environment jsdom
 */

import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { StartedDIFMContentInfo } from '../started-difm-content-info';
import type { Site } from '@automattic/api-core';

const mockNavigate = jest.fn();
const mockCreateSuccessNotice = jest.fn();
const mockCreateErrorNotice = jest.fn();

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useNavigate: () => mockNavigate,
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createSuccessNotice: mockCreateSuccessNotice,
		createErrorNotice: mockCreateErrorNotice,
	} ),
	combineReducers: jest.fn( ( reducers ) => reducers ),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn(),
	keyedReducer: () => () => ( {} ),
} ) );

jest.mock( '@automattic/survicate', () => ( { invokeSurvicateEvent: jest.fn() } ) );

const site = {
	ID: 123,
	slug: 'migration.wordpress.com',
	site_migration: {
		migration_status: 'migration-started-difm',
		in_progress: false,
		is_complete: false,
	},
} as Site;

function MigrationOverview() {
	const { data } = useQuery( {
		...siteBySlugQuery( site.slug ),
		initialData: site,
		staleTime: Infinity,
	} );
	return <StartedDIFMContentInfo site={ data } />;
}

function mockTicket( ticketId: number | null ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/sites/123/automated-migration/find-ticket' )
		.query( true )
		.reply( 200, { ticket_id: ticketId } );
}

beforeEach( () => jest.clearAllMocks() );

it( 'keeps the existing cancellation message when a ticket exists', async () => {
	mockTicket( 456 );
	render( <StartedDIFMContentInfo site={ site } /> );

	await userEvent.click( await screen.findByRole( 'button', { name: 'Cancel migration' } ) );
	expect( await screen.findByText( /our Happiness Engineers will be notified/i ) ).toBeVisible();
	expect(
		within( screen.getByRole( 'dialog' ) ).getByRole( 'button', { name: 'Send request' } )
	).toBeVisible();
} );

it( 'looks up the ticket and offers cancellation when an older transfer is complete', async () => {
	const ticket = mockTicket( null );
	render(
		<StartedDIFMContentInfo
			site={ {
				...site,
				site_migration: {
					...site.site_migration,
					type: 'assisted',
					status_v2: 'started',
					is_complete: true,
				},
			} }
		/>
	);

	await waitFor( () => expect( ticket.isDone() ).toBe( true ) );
	expect( screen.getByRole( 'button', { name: 'Cancel migration' } ) ).toBeVisible();
} );

it( 'waits for fresh site data before navigating after cancelling a ticketless migration', async () => {
	mockTicket( null );
	const cancellation = nock( 'https://public-api.wordpress.com' )
		.post( '/wpcom/v2/sites/123/automated-migration/cancel-migration' )
		.reply( 200, { success: true } );
	const cancelledSite = {
		...site,
		site_migration: { ...site.site_migration, migration_status: 'migration-cancelled-difm' },
	};
	let resolveSiteResponse: ( site: Site ) => void = () => {};
	const siteResponse = new Promise< Site >( ( resolve ) => {
		resolveSiteResponse = resolve;
	} );
	const siteRefresh = nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, () => siteResponse );
	const { queryClient } = render( <MigrationOverview /> );
	const siteQueryKey = siteBySlugQuery( site.slug ).queryKey;
	queryClient.setQueryData( siteQueryKey, site );
	const siteAtNavigation = jest.fn();
	mockNavigate.mockImplementationOnce( () => {
		siteAtNavigation( queryClient.getQueryData( siteQueryKey ) );
	} );

	await userEvent.click( await screen.findByRole( 'button', { name: 'Cancel migration' } ) );
	expect( screen.getByText( /your original site will stay as is/i ) ).toBeVisible();
	const confirmButton = within( screen.getByRole( 'dialog' ) ).getByRole( 'button', {
		name: 'Cancel migration',
	} );
	await userEvent.click( confirmButton );

	await waitFor( () => expect( siteRefresh.isDone() ).toBe( true ) );
	expect( mockNavigate ).not.toHaveBeenCalled();
	expect( confirmButton ).not.toHaveClass( 'is-busy' );
	resolveSiteResponse( cancelledSite );

	await waitFor( () =>
		expect( mockNavigate ).toHaveBeenCalledWith( {
			to: '/sites/$siteSlug',
			params: { siteSlug: site.slug },
		} )
	);
	expect( cancellation.isDone() ).toBe( true );
	expect( siteAtNavigation ).toHaveBeenCalledWith( cancelledSite );
	expect( mockCreateSuccessNotice ).toHaveBeenCalledWith( 'Migration cancelled.', {
		type: 'snackbar',
	} );
} );

it( 'does not navigate if refreshing the site fails', async () => {
	mockTicket( null );
	nock( 'https://public-api.wordpress.com' )
		.post( '/wpcom/v2/sites/123/automated-migration/cancel-migration' )
		.reply( 200, { success: true } );
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 404, { error: 'unknown_blog', message: 'Unable to load site' } );
	render( <MigrationOverview /> );

	await userEvent.click( await screen.findByRole( 'button', { name: 'Cancel migration' } ) );
	const confirmButton = within( screen.getByRole( 'dialog' ) ).getByRole( 'button', {
		name: 'Cancel migration',
	} );
	await userEvent.click( confirmButton );

	await waitFor( () =>
		expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
			'We couldn’t cancel your migration. Please try again or contact support.',
			{ type: 'snackbar' }
		)
	);
	expect( confirmButton ).not.toHaveClass( 'is-busy' );
	expect( mockNavigate ).not.toHaveBeenCalled();
	expect( mockCreateSuccessNotice ).not.toHaveBeenCalled();
} );

it( 'requests support cancellation for an active transfer with a ticket', async () => {
	mockTicket( 456 );
	const cancellation = nock( 'https://public-api.wordpress.com' )
		.post( '/wpcom/v2/sites/123/automated-migration/cancel-migration' )
		.reply( 200, { success: true } );
	render(
		<StartedDIFMContentInfo
			site={ { ...site, site_migration: { ...site.site_migration, in_progress: true } } }
		/>
	);

	await userEvent.click(
		await screen.findByRole( 'button', { name: 'Request migration cancellation' } )
	);
	expect( screen.getByText( /send us a cancellation request/i ) ).toBeVisible();
	await userEvent.click(
		within( screen.getByRole( 'dialog' ) ).getByRole( 'button', { name: 'Cancel migration' } )
	);

	await waitFor( () =>
		expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
			'Migration cancellation request sent.',
			{ type: 'snackbar' }
		)
	);
	expect( cancellation.isDone() ).toBe( true );
	expect( mockNavigate ).not.toHaveBeenCalled();
} );

it( 'does not offer cancellation for an active transfer without a ticket', async () => {
	const ticket = mockTicket( null );
	render(
		<StartedDIFMContentInfo
			site={ { ...site, site_migration: { ...site.site_migration, in_progress: true } } }
		/>
	);

	await waitFor( () => expect( ticket.isDone() ).toBe( true ) );
	expect( screen.queryByRole( 'button', { name: /cancellation/i } ) ).toBeNull();
} );

it( 'does not offer cancellation for a completed migration', async () => {
	render(
		<StartedDIFMContentInfo
			site={ {
				...site,
				site_migration: {
					...site.site_migration,
					migration_status: 'migration-completed-difm',
					is_complete: true,
				},
			} }
		/>
	);

	await screen.findByRole( 'heading', { name: 'We’ve received your migration request' } );
	expect( screen.queryByRole( 'button', { name: /cancel migration/i } ) ).toBeNull();
} );
