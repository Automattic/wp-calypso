import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import OdysseyQuerySiteFeatures from '../odyssey-query-site-features';

const mockGet = jest.fn();
jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { get: ( ...args: unknown[] ) => mockGet( ...args ) } },
} ) );

let mockIsJetpack = true;
const mockIsEnabled = ( flag: string ) => flag === 'is_running_in_jetpack_site' && mockIsJetpack;
// The build aliases `@automattic/calypso-config` to the Odyssey wrapper; Jest doesn't, and
// `get-api` reads the former while the component reads the latter.
jest.mock( '../../lib/config-api', () => ( {
	__esModule: true,
	default: Object.assign( () => undefined, {
		isEnabled: ( flag: string ) => mockIsEnabled( flag ),
	} ),
} ) );
jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: Object.assign( () => undefined, {
		isEnabled: ( flag: string ) => mockIsEnabled( flag ),
	} ),
	isEnabled: ( flag: string ) => mockIsEnabled( flag ),
} ) );

const features = { active: [ 'stats-commercial' ], available: { 'stats-paid': [ 'personal' ] } };

const renderQuery = () => {
	const dispatch = jest.fn();
	const store = { dispatch, getState: () => ( {} ), subscribe: () => () => undefined };
	render(
		<QueryClientProvider client={ new QueryClient() }>
			<Provider store={ store as never }>
				<OdysseyQuerySiteFeatures siteIds={ [ 123 ] } />
			</Provider>
		</QueryClientProvider>
	);
	return dispatch;
};

describe( 'OdysseyQuerySiteFeatures', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsJetpack = true;
	} );

	it( 'reads the features through Jetpack on a Jetpack site and unwraps its envelope', async () => {
		mockGet.mockResolvedValue( { code: 'success', data: JSON.stringify( features ) } );
		const dispatch = renderQuery();

		await waitFor( () =>
			expect( dispatch ).toHaveBeenCalledWith( {
				type: 'SITE_FEATURES_FETCH_COMPLETED',
				siteId: 123,
				features,
			} )
		);
		expect( mockGet ).toHaveBeenCalledWith( {
			path: '/site/features',
			apiNamespace: 'jetpack/v4',
		} );
		expect( dispatch ).toHaveBeenCalledWith( { type: 'SITE_FEATURES_FETCH', siteId: 123 } );
	} );

	it( "asks WordPress.com directly from a Simple site's wp-admin", async () => {
		mockIsJetpack = false;
		mockGet.mockResolvedValue( features );
		const dispatch = renderQuery();

		await waitFor( () =>
			expect( dispatch ).toHaveBeenCalledWith( {
				type: 'SITE_FEATURES_FETCH_COMPLETED',
				siteId: 123,
				features,
			} )
		);
		expect( mockGet ).toHaveBeenCalledWith( {
			path: '/sites/123/features',
			apiNamespace: 'rest/v1.1',
		} );
	} );

	it( 'records a failure rather than leaving the request hanging', async () => {
		mockGet.mockRejectedValue( new Error( 'nope' ) );
		const dispatch = renderQuery();

		await waitFor( () =>
			expect( dispatch ).toHaveBeenCalledWith( {
				type: 'SITE_FEATURES_FETCH_FAILED',
				siteId: 123,
				error: 'features_fetch_failed',
			} )
		);
	} );
} );
