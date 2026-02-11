import { SITE_FIELDS, SITE_OPTIONS } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute } from '@tanstack/react-router';
import { render as testingLibraryRender } from '@testing-library/react';
import { Suspense } from 'react';
import { type AnalyticsClient, AnalyticsProvider } from './app/analytics';
import { AuthContext } from './app/auth';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from './app/context';
import type { Site, User, UserPreferences } from '@automattic/api-core';

const defaultUser = {
	ID: 1,
	username: 'testuser',
	email: 'test@example.com',
	language: 'en',
} as User;

function createTestRouter( ui: React.ReactElement ) {
	const Component = () => ui;

	return createRouter( {
		routeTree: createRootRoute( {
			pendingMs: 0,
			component: () => (
				<Suspense fallback={ <div data-testid="loading" /> }>
					<Component />
				</Suspense>
			),
		} ),
	} );
}

type RenderResult = ReturnType< typeof testingLibraryRender > &
	AnalyticsClient & {
		router: ReturnType< typeof createTestRouter >;
		queryClient: QueryClient;
	};

interface RenderOptions {
	user?: User;
	queryClient?: QueryClient;
}

export function render( ui: React.ReactElement, options: RenderOptions = {} ): RenderResult {
	const { user = defaultUser, queryClient: providedClient } = options;
	const queryClient = providedClient ?? createQueryClientBuilder().build();
	const router = createTestRouter( ui );

	const recordTracksEvent = jest.fn();
	const recordPageView = jest.fn();

	const testingLibraryResult = testingLibraryRender(
		<QueryClientProvider client={ queryClient }>
			<AppProvider config={ APP_CONTEXT_DEFAULT_CONFIG }>
				<AnalyticsProvider client={ { recordTracksEvent, recordPageView } }>
					<AuthContext.Provider value={ { user, logout: jest.fn() } }>
						<RouterProvider router={ router } context={ { config: { basePath: '/' } } } />
					</AuthContext.Provider>
				</AnalyticsProvider>
			</AppProvider>
		</QueryClientProvider>
	);

	return {
		...testingLibraryResult,
		router,
		queryClient,
		recordTracksEvent,
		recordPageView,
	};
}

/**
 * Fluent builder for pre-populating a QueryClient with test data.
 *
 * Encapsulates query key structures so tests don't need to import
 * SITE_FIELDS, SITE_OPTIONS, or know internal cache key details.
 * @example
 * const queryClient = createQueryClientBuilder()
 *   .addSiteById( 1, mockSite )
 *   .setPreference( 'my-pref': 'value' )
 *   .build();
 *
 * render( <MyComponent />, { queryClient } );
 */
export function createQueryClientBuilder() {
	const entries: Array< { key: unknown[]; data: unknown } > = [];
	let staleTime: number | undefined = undefined;
	let retry = false;

	const isPrefsCacheKey = ( key: unknown ) => {
		return (
			Array.isArray( key ) && key.length === 2 && key[ 0 ] === 'me' && key[ 1 ] === 'preferences'
		);
	};

	const builder = {
		/**
		 * By default the builder starts with some default entries in the cache.
		 * Use this method to start the query cache from a clean slate.
		 */
		empty() {
			entries.splice( 0 );
			return builder;
		},
		addSiteBySlug( slug: string, site: Site ) {
			entries.push( { key: [ 'site-by-slug', slug, SITE_FIELDS, SITE_OPTIONS ], data: site } );
			return builder;
		},
		addSiteById( id: number, site: Site ) {
			entries.push( { key: [ 'site-by-id', id, SITE_FIELDS, SITE_OPTIONS ], data: site } );
			return builder;
		},
		setPreference< T extends keyof UserPreferences >(
			prefKey: T,
			prefValue: UserPreferences[ T ]
		) {
			const existingEntry = entries.find( ( e ) => isPrefsCacheKey( e.key ) );
			if ( existingEntry ) {
				( existingEntry.data as Partial< UserPreferences > )[ prefKey ] = prefValue;
			} else {
				entries.push( { key: [ 'me', 'preferences' ], data: { [ prefKey ]: prefValue } } );
			}
			return builder;
		},
		/**
		 * Generic escape hatch for adding queries to the cache which are not covered
		 * by named builder methods.
		 */
		withQueryData( key: unknown[], data: unknown ) {
			entries.push( { key, data } );
			return builder;
		},
		withRetry() {
			retry = true;
			return builder;
		},
		withStaleTime( t: number ) {
			staleTime = t;
			return builder;
		},
		build() {
			const qc = new QueryClient( {
				defaultOptions: { queries: { retry, staleTime } },
			} );
			for ( const entry of entries ) {
				qc.setQueryData( entry.key, entry.data );
			}
			return qc;
		},
	};

	return builder.withQueryData( [ 'me', 'preferences' ], {} );
}
