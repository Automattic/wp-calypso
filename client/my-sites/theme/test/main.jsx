/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import { receiveTheme, themeRequestFailure } from 'calypso/state/themes/actions';
import ThemeSheetComponent from '../main';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/my-sites/themes/theme-preview', () =>
	require( 'calypso/components/empty-component' )
);

const themeData = {
	name: 'Twenty Sixteen',
	author: 'the WordPress team',
	screenshot:
		'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
	description: 'Twenty Sixteen is a modernized take on an ever-popular WordPress layout — ...',
	descriptionLong: '<p>Mumble Mumble</p>',
	download: 'https://public-api.wordpress.com/rest/v1/themes/download/twentysixteen.zip',
	taxonomies: {},
	stylesheet: 'pub/twentysixteen',
	demo_uri: 'https://twentysixteendemo.wordpress.com/',
};

let queryClient;

const TestComponent = ( { themeId, store } ) => {
	queryClient = new QueryClient();
	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<ThemeSheetComponent id={ themeId } />
			</QueryClientProvider>
		</ReduxProvider>
	);
};

describe( 'main', () => {
	afterEach( () => {
		queryClient.clear();
	} );

	test( "doesn't throw an exception without theme data", () => {
		const store = createReduxStore();
		setStore( store );
		let markup;
		expect( () => {
			markup = render( <TestComponent store={ store } themeId="twentysixteen" /> )?.container;
		} ).not.toThrow();
		expect( markup.getElementsByClassName( 'theme__sheet' ) ).toHaveLength( 1 );
	} );

	test( "doesn't throw an exception with theme data", () => {
		const store = createReduxStore();
		setStore( store );
		store.dispatch( receiveTheme( themeData ) );
		let markup;
		expect( () => {
			markup = render( <TestComponent store={ store } themeId="twentysixteen" /> )?.container;
		} ).not.toThrow();
		expect( markup.getElementsByClassName( 'theme__sheet' ) ).toHaveLength( 1 );
	} );

	test( "doesn't throw an exception with invalid theme data", () => {
		const store = createReduxStore();
		setStore( store );
		store.dispatch( themeRequestFailure( 'wpcom', 'invalidthemeid', 'not found' ) );
		let markup;
		expect( () => {
			markup = render( <TestComponent store={ store } themeId="invalidthemeid" /> )?.container;
		} ).not.toThrow();
		expect( markup.getElementsByClassName( 'empty-content' ) ).toHaveLength( 1 );
	} );
} );
