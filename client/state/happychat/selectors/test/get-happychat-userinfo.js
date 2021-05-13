/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import getUserInfo from 'calypso/state/happychat/selectors/get-happychat-userinfo';

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

	beforeAll( () => {
		global.window = {
			innerWidth: 'windowInnerWidth',
			innerHeight: 'windowInnerHeight',
			screen: {
				width: 'screenWidth',
				height: 'screenHeight',
			},
			navigator: {
				userAgent: 'navigatorUserAgent',
			},
		};
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
