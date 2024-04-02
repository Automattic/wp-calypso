/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import BlazePageViewTracker from '../';

const mockPageViewTrackerProps = jest.fn();
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => ( {
	...jest.requireActual( 'calypso/lib/analytics/page-view-tracker' ),
	UnconnectedPageViewTracker: ( props ) => {
		mockPageViewTrackerProps( props );
		return null;
	},
} ) );

const initialState = {
	sites: {
		items: {
			1: {
				ID: 1,
				URL: 'example.wordpress.com',
			},
		},
	},
	ui: {
		selectedSiteId: 1,
	},
	currentUser: {
		id: 12,
		user: {
			email_verified: true,
			site_count: 1,
			primary_blog: 1,
		},
	},
};

let features = [];

const mockStore = configureStore();
const renderWithRedux = ( ui, state = initialState ) => {
	const store = mockStore( state );

	return render( <Provider store={ store }>{ ui }</Provider> );
};

describe( 'BlazePageViewTracker', () => {
	let originalWindowLocation;
	beforeAll( () => {
		originalWindowLocation = global.window.location;
		delete global.window.location;

		jest
			.spyOn( config, 'isEnabled' )
			.mockImplementation( ( flag ) => features.indexOf( flag ) > -1 );
	} );
	afterAll( () => {
		global.window.location = originalWindowLocation;
	} );

	test( 'should pass correct information to PageViewTracker for Calypso', () => {
		global.window.location = {
			href: 'http://example.wordpress.com/advertising/example.wordpress.com',
			pathname: '/advertising/example.wordpress.com',
		};
		features = [];
		mockPageViewTrackerProps.mockClear();

		renderWithRedux( <BlazePageViewTracker path="/advertising/posts/:site" title="Advertising" /> );
		expect( mockPageViewTrackerProps ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/advertising/posts/:site',
				title: 'Advertising',
				properties: {
					origin: 'calypso',
				},
				hasSelectedSiteLoaded: true,
			} )
		);
	} );

	test( 'should pass correct information to PageViewTracker for Jetpack', () => {
		global.window.location = {
			href: 'http://example.wordpress.com/wp-admin/tools.php',
			pathname: '/wp-admin/tools.php',
		};
		features = [ 'is_running_in_jetpack_site' ];
		mockPageViewTrackerProps.mockClear();

		renderWithRedux( <BlazePageViewTracker path="/advertising/posts/:site" title="Advertising" /> );
		expect( mockPageViewTrackerProps ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/advertising/posts/:site',
				title: 'Advertising',
				properties: {
					origin: 'jetpack',
				},
				hasSelectedSiteLoaded: true,
			} )
		);
	} );
} );
