/** @format */

/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import getUserInfo from 'state/happychat/selectors/get-happychat-userinfo';

describe( 'HAPPYCHAT_IO_SEND_MESSAGE_USERINFO action', () => {
	const state = {
		happychat: {
			user: {
				geoLocation: {
					city: 'Timisoara',
				},
			},
		},
	};

	const previousWindow = global.window;
	const previousScreen = global.screen;
	const previousNavigator = global.navigator;

	beforeAll( () => {
		global.window = {
			innerWidth: 'windowInnerWidth',
			innerHeight: 'windowInnerHeight',
		};
		global.screen = {
			width: 'screenWidth',
			height: 'screenHeight',
		};
		global.navigator = {
			userAgent: 'navigatorUserAgent',
		};
	} );

	afterAll( () => {
		global.window = previousWindow;
		global.screen = previousScreen;
		global.navigator = previousNavigator;
	} );

	test( 'should send relevant browser information to the connection', () => {
		const expectedInfo = {
			howCanWeHelp: 'howCanWeHelp',
			howYouFeel: 'howYouFeel',
			siteId: 'siteId',
			siteUrl: 'siteUrl',
			localDateTime: moment().format( 'h:mm a, MMMM Do YYYY' ),
			screenSize: {
				width: 'screenWidth',
				height: 'screenHeight',
			},
			browserSize: {
				width: 'windowInnerWidth',
				height: 'windowInnerHeight',
			},
			userAgent: 'navigatorUserAgent',
			geoLocation: state.happychat.user.geoLocation,
		};

		const userInfo = getUserInfo( state )( {
			site: {
				ID: 'siteId',
				URL: 'siteUrl',
			},
			howCanWeHelp: 'howCanWeHelp',
			howYouFeel: 'howYouFeel',
		} );

		expect( userInfo ).toEqual( expectedInfo );
	} );
} );
