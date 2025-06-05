import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderToString } from 'react-dom/server';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import { receiveTheme, themeRequestFailure } from 'calypso/state/themes/actions';
import ThemeSheetComponent from '../main';

jest.mock( '@automattic/odie-client/src/data', () => ( {
	useManageSupportInteraction: jest.fn().mockReturnValue( {
		startNewInteraction: jest.fn(),
		resolveInteraction: jest.fn(),
		addEventToInteraction: jest.fn(),
	} ),
	useGetZendeskConversation: jest.fn(),
	useOdieChat: jest.fn(),
	broadcastOdieMessage: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/my-sites/themes/theme-preview', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'dompurify', () => ( {
	sanitize: jest.fn().mockImplementation( ( text ) => text ),
} ) );

const mockWindow = {
	location: {
		hash: '',
		href: 'http://example.com',
		origin: 'http://example.com',
		pathname: '/',
		search: '',
	},
	matchMedia: () => ( {
		matches: false,
		addListener: () => {},
		removeListener: () => {},
	} ),
	scroll: () => {},
};

global.window = mockWindow;
global.document = {
	readyState: 'complete',
};

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
		// Reset window hash after each test
		window.location.hash = '';
	} );

	test( "doesn't throw an exception without theme data", () => {
		const store = createReduxStore();
		setStore( store );
		let markup;
		expect( () => {
			markup = renderToString( <TestComponent store={ store } themeId="twentysixteen" /> );
		} ).not.toThrow();
		expect( markup.includes( 'theme__sheet' ) ).toBeTruthy();
	} );

	test( "doesn't throw an exception with theme data", () => {
		const store = createReduxStore();
		setStore( store );
		store.dispatch( receiveTheme( themeData ) );
		let markup;
		expect( () => {
			markup = renderToString( <TestComponent store={ store } themeId="twentysixteen" /> );
		} ).not.toThrow();
		expect( markup.includes( 'theme__sheet' ) ).toBeTruthy();
	} );

	test( "doesn't throw an exception with invalid theme data", () => {
		const store = createReduxStore();
		setStore( store );
		store.dispatch( themeRequestFailure( 'wpcom', 'invalidthemeid', 'not found' ) );
		let markup;
		expect( () => {
			markup = renderToString( <TestComponent store={ store } themeId="invalidthemeid" /> );
		} ).not.toThrow();
		expect( markup.includes( 'empty-content' ) ).toBeTruthy();
	} );
} );
