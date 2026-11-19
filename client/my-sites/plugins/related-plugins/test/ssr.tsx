/**
 * @jest-environment node
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import {
	getRelatedPluginsQueryParams,
	RELATED_PLUGINS_CAROUSEL_LIST_SIZE,
} from 'calypso/data/marketplace/use-get-related-plugins';
import { RelatedPlugins } from '../';

const loggedOutState = {
	currentUser: { id: null },
	ui: { selectedSiteId: null },
	preferences: { localValues: {}, remoteValues: null },
	sites: { items: {} },
};

const relatedPlugins = [
	{ slug: 'first-related', name: 'First Related', short_description: 'One', categories: [] },
	{ slug: 'second-related', name: 'Second Related', short_description: 'Two', categories: [] },
];

function renderOnServer( queryClient: QueryClient ) {
	const store = createStore( () => loggedOutState );

	return renderToString(
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<RelatedPlugins slug="sensei-pro" seeAllLink="/plugins/sensei-pro/related/" />
			</QueryClientProvider>
		</Provider>
	);
}

describe( 'RelatedPlugins', () => {
	// Crawlers only follow links that are in the server-rendered HTML.
	test( 'renders crawlable links to prefetched related plugins on the server', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData(
			getRelatedPluginsQueryParams( 'sensei-pro', RELATED_PLUGINS_CAROUSEL_LIST_SIZE ).queryKey,
			relatedPlugins
		);

		const html = renderOnServer( queryClient );

		expect( html ).toContain( 'Related plugins' );
		expect( html ).toContain( 'href="/plugins/first-related"' );
		expect( html ).toContain( 'href="/plugins/second-related"' );
	} );

	test( 'renders nothing on the server when the related plugins were not prefetched', () => {
		expect( renderOnServer( new QueryClient() ) ).toBe( '' );
	} );
} );
