/**
 * @jest-environment jsdom
 */

import { DomainSubtype, type Domain } from '@automattic/api-core';
import { domainQuery, queryClient } from '@automattic/api-queries';
import { createRouter } from '@tanstack/react-router';
import { select, dispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { createDomainsRoutes } from '../domains';
import { rootRoute } from '../root';

const DOMAIN_NAME = 'example.com';

const nonTransferableDomain = {
	domain: DOMAIN_NAME,
	blog_id: 1,
	site_slug: 'example.wordpress.com',
	current_user_is_owner: true,
	can_transfer_to_any_user: false,
	can_transfer_to_other_site: false,
	subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
} as Domain;

function createTestRouter() {
	return createRouter( {
		routeTree: rootRoute.addChildren( createDomainsRoutes() ),
		context: { config: APP_CONTEXT_DEFAULT_CONFIG },
	} );
}

function getSnackbarNotices() {
	return select( noticesStore ).getNotices();
}

describe( 'domain routes', () => {
	beforeEach( () => {
		queryClient.setQueryData( domainQuery( DOMAIN_NAME ).queryKey, nonTransferableDomain );
		getSnackbarNotices().forEach( ( { id } ) => dispatch( noticesStore ).removeNotice( id ) );
	} );

	afterEach( () => {
		queryClient.clear();
	} );

	describe( 'transfer route permission guard', () => {
		it( 'does not create a notice when the route is only preloaded', async () => {
			const router = createTestRouter();

			await router.preloadRoute( {
				to: '/domains/$domainName/transfer',
				params: { domainName: DOMAIN_NAME },
			} );

			expect( getSnackbarNotices() ).toHaveLength( 0 );
		} );

		it( 'redirects to the domain overview with a notice when the route is visited', async () => {
			const router = createTestRouter();

			await router.load();
			await router.navigate( {
				to: '/domains/$domainName/transfer',
				params: { domainName: DOMAIN_NAME },
			} );
			await router.invalidate();

			expect( router.state.location.pathname ).toBe( `/domains/${ DOMAIN_NAME }` );
			expect( getSnackbarNotices() ).toEqual( [
				expect.objectContaining( {
					content: 'You do not have permission to transfer this domain.',
				} ),
			] );
		} );
	} );
} );
