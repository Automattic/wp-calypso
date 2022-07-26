import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import PluginDetails from '../plugin-details';
import PluginBrowser from '../plugins-browser';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/my-sites/themes/theme-preview', () =>
	require( 'calypso/components/empty-component' )
);

let queryClient;

const TestComponent = ( { store, children } ) => {
	queryClient = new QueryClient();
	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</ReduxProvider>
	);
};

describe( 'PluginBrowser', () => {
	afterEach( () => {
		queryClient.clear();
	} );

	test( "doesn't throw an exception without theme data", () => {
		const store = createReduxStore();
		setStore( store );

		const props = {
			path: '/plugins',
			category: undefined,
			search: undefined,
		};
		expect( () => {
			renderToString(
				<TestComponent store={ store }>
					<PluginBrowser { ...props } />
				</TestComponent>
			);
		} ).not.toThrow();
	} );
} );

describe( 'PluginDetails', () => {
	afterEach( () => {
		queryClient.clear();
	} );
	test( "doesn't throw an exception without theme data", () => {
		const store = createReduxStore();
		setStore( store );

		const props = {
			path: '/plugins/elementor',
			pluginSlug: 'elementor',
			siteUrl: undefined,
		};
		expect( () => {
			renderToString(
				<TestComponent store={ store }>
					<PluginDetails { ...props } />
				</TestComponent>
			);
		} ).not.toThrow();
	} );
} );
