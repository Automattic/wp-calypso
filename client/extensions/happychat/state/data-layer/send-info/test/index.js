/**
 * External dependencies
 */
import { expect } from 'chai';
import moment from 'moment';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_SEND_USER_INFO,
} from 'state/action-types';
import sendInfo from '../index';

describe( 'HAPPYCHAT_SEND_USER_INFO action', () => {
	const state = {
		extensions: {
			happychat: {
				geoLocation: {
					city: 'Timisoara'
				}
			}
		}
	};

	const previousWindow = global.window;
	const previousScreen = global.screen;
	const previousNavigator = global.navigator;

	before( () => {
		global.window = {
			innerWidth: 'windowInnerWidth',
			innerHeight: 'windowInnerHeight',
		};
		global.screen = {
			width: 'screenWidth',
			height: 'screenHeight',
		};
		global.navigator = {
			userAgent: 'navigatorUserAgent'
		};
	} );

	after( () => {
		global.window = previousWindow;
		global.screen = previousScreen;
		global.navigator = previousNavigator;
	} );

	it( 'should send relevant browser information to the connection', () => {
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
			geoLocation: state.extensions.happychat.geoLocation
		};

		const getState = () => state;
		const connection = { sendInfo: spy() };
		const action = {
			type: HAPPYCHAT_SEND_USER_INFO,
			site: {
				ID: 'siteId',
				URL: 'siteUrl'
			},
			howCanWeHelp: 'howCanWeHelp',
			howYouFeel: 'howYouFeel',
		};
		sendInfo( connection )( { getState }, action );

		expect( connection.sendInfo ).to.have.been.calledOnce;
		expect( connection.sendInfo ).to.have.been.calledWithMatch( expectedInfo );
	} );
} );
