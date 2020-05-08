/**
 * External dependencies
 */
import PopupMonitor from '@automattic/popup-monitor';

/**
 * Internal dependencies
 */
import requestExternalAccess from '../src';

jest.mock( '@automattic/popup-monitor' );

const popupMonitorMocks = {
	open: jest.fn(),
	once: jest.fn(),
	on: jest.fn( ( _, cb ) =>
		cb( {
			keyring_id: '123',
			id_token: 'abc123',
			user: {
				name: 'Foo',
			},
		} )
	),
	getScreenCenterSpecs: jest.fn( () => 'screenSpecs' ),
};

PopupMonitor.mockImplementation( () => ( { ...popupMonitorMocks } ) );

const serviceURL = 'https://foobar.com';
const callback = jest.fn();

describe( 'requestExternalAccess', () => {
	beforeAll( () => {
		requestExternalAccess( serviceURL, callback );
	} );

	afterAll( () => {
		PopupMonitor.mockReset();
	} );

	test( 'opens popup window with correct params', () => {
		expect( popupMonitorMocks.open ).toHaveBeenCalledWith(
			'https://foobar.com',
			null,
			'toolbar=0,location=0,status=0,menubar=0,screenSpecs'
		);
	} );

	test( 'calls for correct screen center specs', () => {
		expect( popupMonitorMocks.getScreenCenterSpecs ).toHaveBeenCalledWith( 780, 700 );
	} );

	test( 'sets the popup window "close" event listener with correct params', () => {
		expect( popupMonitorMocks.once ).toHaveBeenCalledWith( 'close', expect.any( Function ) );
	} );

	test( 'on popup window close, calls the callback function and passes correct result object', () => {
		popupMonitorMocks.once.mock.calls[ 0 ][ 1 ]();
		expect( callback ).toHaveBeenCalledWith( {
			keyring_id: 123,
			id_token: 'abc123',
			user: {
				name: 'Foo',
			},
		} );
	} );

	test( 'sets the "message" event listener for the popup window', () => {
		expect( popupMonitorMocks.on ).toHaveBeenCalledWith( 'message', expect.any( Function ) );
	} );
} );
