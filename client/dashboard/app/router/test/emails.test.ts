/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import nock from 'nock';
import { DOTCOM_DASHBOARD_SECTION_PATHS } from '../../../app-dotcom/section';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { createEmailsRoutes } from '../emails';
import { rootRoute } from '../root';

jest.mock( '../../../emails', () => ( { __esModule: true, default: () => null } ) );

beforeEach( () => {
	queryClient.clear();
} );

test.each( [ '/email', '/email/' ] )(
	'redirects %s to the emails page and preserves the query and fragment',
	async ( path ) => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/me/sites' )
			.query( true )
			.reply( 200, { sites: [] } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1/me/mailboxes' )
			.query( true )
			.reply( 200, [] );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/all-domains' )
			.query( true )
			.reply( 200, { domains: [] } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/preferences' )
			.query( true )
			.reply( 200, { calypso_preferences: {} } );

		const router = createRouter( {
			routeTree: rootRoute.addChildren( createEmailsRoutes() ),
			history: createMemoryHistory( {
				initialEntries: [ `${ path }?domainName=example.com&ref=campaign#mailboxes` ],
			} ),
			context: { config: APP_CONTEXT_DEFAULT_CONFIG },
		} );

		await router.load();

		expect( router.state.location.pathname ).toBe( '/emails' );
		expect( router.state.location.search ).toMatchObject( {
			domainName: 'example.com',
			ref: 'campaign',
		} );
		expect( router.state.location.hash ).toBe( 'mailboxes' );
		expect( router.state.matches.every( ( match ) => match.status === 'success' ) ).toBe( true );
	}
);

test( 'serves the dashboard entry point for direct visits to /email', () => {
	expect( DOTCOM_DASHBOARD_SECTION_PATHS ).toContain( '/email' );
} );
