/**
 * @vitest-environment jsdom
 */
import { DomainSubtype, DomainTransferStatus } from '@automattic/api-core';
import { domainQuery, domainWhoisQuery, queryClient } from '@automattic/api-queries';
import { isSupportSession } from '@automattic/calypso-support-session';
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import nock from 'nock';
import { vi } from 'vitest';
import { DomainPermissionError } from '../../../utils/domain-permissions';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { createDomainsRoutes, domainRoute, domainTransferIndexRoute } from '../domains';
import { rootRoute } from '../root';

vi.mock( '@automattic/calypso-support-session', async ( importOriginal ) => ( {
	...( await importOriginal< typeof import( '@automattic/calypso-support-session' ) >() ),
	isSupportSession: vi.fn( () => false ),
} ) );

afterEach( () => {
	queryClient.clear();
	nock.cleanAll();
	vi.mocked( isSupportSession ).mockReturnValue( false );
} );

function seedDomain() {
	queryClient.setQueryData( domainQuery( 'example.com' ).queryKey, {
		domain: 'example.com',
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION },
		current_user_is_owner: true,
		can_update_contact_info: true,
	} as never );
	queryClient.setQueryData( domainWhoisQuery( 'example.com' ).queryKey, [] as never );
	nock( 'https://public-api.wordpress.com' ).persist().get( /.*/ ).reply( 200, {} );
}

function createDomainsRouter( url: string ) {
	return createRouter( {
		routeTree: rootRoute.addChildren( createDomainsRoutes() ),
		history: createMemoryHistory( { initialEntries: [ url ] } ),
		context: { config: APP_CONTEXT_DEFAULT_CONFIG },
	} );
}

function getDomainMatch( router: ReturnType< typeof createDomainsRouter > ) {
	return router.state.matches.find( ( { routeId } ) => routeId === domainRoute.id );
}

test( 'the contact info page opens for the domain owner', async () => {
	seedDomain();
	const router = createDomainsRouter( '/domains/example.com' );
	await router.load();

	await router.navigate( {
		to: '/domains/$domainName/contact-info',
		params: { domainName: 'example.com' },
	} );

	expect( router.state.location.pathname ).toBe( '/domains/example.com/contact-info' );
	expect( getDomainMatch( router )?.status ).toBe( 'success' );
} );

test( 'the contact info page is blocked in a support session when opened from the domain overview', async () => {
	vi.mocked( isSupportSession ).mockReturnValue( true );
	seedDomain();
	const router = createDomainsRouter( '/domains/example.com' );
	await router.load();
	expect( getDomainMatch( router )?.status ).toBe( 'success' );

	await router.navigate( {
		to: '/domains/$domainName/contact-info',
		params: { domainName: 'example.com' },
	} );

	expect( router.state.location.pathname ).toBe( '/domains/example.com/contact-info' );
	expect( getDomainMatch( router ) ).toMatchObject( {
		status: 'error',
		error: expect.any( DomainPermissionError ),
	} );
} );

test.each( [ DomainTransferStatus.PENDING_START, DomainTransferStatus.COMPLETED ] )(
	'the transfer page keeps `back_to` when redirecting a %s transfer',
	async ( transfer_status ) => {
		queryClient.setQueryData( domainQuery( 'example.com' ).queryKey, {
			domain: 'example.com',
			subtype: { id: DomainSubtype.DOMAIN_TRANSFER },
			transfer_status,
		} as never );
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const loader = domainTransferIndexRoute.options.loader as any;

		const redirect = await loader( {
			params: { domainName: 'example.com' },
			location: { search: { back_to: 'site-domains' } },
		} ).catch( ( error: unknown ) => error );

		expect( redirect ).toMatchObject( { options: { search: { back_to: 'site-domains' } } } );
	}
);
