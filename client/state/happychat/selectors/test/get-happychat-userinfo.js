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
		currentUser: {
			id: 1,
			date: moment().format(), // format: 2012-03-12T01:06:14+00:00
		},
		happychat: {
			user: {
				geoLocation: {
					city: 'Timisoara',
				},
			},
		},
		signup: {
			flow: {
				currentFlowName: 'river',
			},
			progress: [
				{
					status: 'in-progress',
					stepName: 'site-type',
					lastUpdated: Date.parse( moment().format() ), // format: 1545116611464,
				},
			],
		},
		users: {
			items: {
				'1': {
					ID: 1,
					date: moment().format(), // format: 2012-03-12T01:06:14+00:00
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
			lastSignupProgress: moment( state.signup.progress[ 0 ].lastUpdated ).fromNow(),
			howCanWeHelp: 'howCanWeHelp',
			howYouFeel: 'howYouFeel',
			siteId: 'siteId',
			siteUrl: 'siteUrl',
			lastIncompleteSignupStep: 'site-type',
			lastSignupFlow: 'river',
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
			userRegistered: moment( state.currentUser.date ).fromNow(),
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
