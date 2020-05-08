/**
 * External dependencies
 */
import PopupMonitor from '@automattic/popup-monitor';

/**
 * Internal dependencies
 */
import requestExternalAccess from '../src';

const serviceURL = 'https://foobar.com';
const callback = jest.fn();

jest.mock( '@automattic/popup-monitor', () => {
	function PopupMonitorMock() {}

	PopupMonitorMock.prototype.open = jest.fn();
	PopupMonitorMock.prototype.once = jest.fn();
	PopupMonitorMock.prototype.on = jest.fn( ( _, cb ) =>
		cb( {
			keyring_id: '123',
			id_token: 'abc123',
			user: {
				name: 'Foo',
			},
		} )
	);
	PopupMonitorMock.prototype.getScreenCenterSpecs = jest.fn( () => 'screenSpecs' );

	return PopupMonitorMock;
} );

describe( 'requestExternalAccess', () => {
	beforeAll( () => {
		requestExternalAccess( serviceURL, callback );
	} );

	test( 'opens popup window with correct params', () => {
		expect( PopupMonitor.prototype.open ).toHaveBeenCalledWith(
			'https://foobar.com',
			null,
			'toolbar=0,location=0,status=0,menubar=0,screenSpecs'
		);
	} );

	test( 'calls for correct screen center specs', () => {
		expect( PopupMonitor.prototype.getScreenCenterSpecs ).toHaveBeenCalledWith( 780, 700 );
	} );

	test( 'sets the popup window "close" event listener with correct params', () => {
		expect( PopupMonitor.prototype.once ).toHaveBeenCalledWith( 'close', expect.any( Function ) );
	} );

	test( 'on popup window close, calls the callback function and passes correct result object', () => {
		PopupMonitor.prototype.once.mock.calls[ 0 ][ 1 ]();
		expect( callback ).toHaveBeenCalledWith( {
			keyring_id: 123,
			id_token: 'abc123',
			user: {
				name: 'Foo',
			},
		} );
	} );

	test( 'sets the "message" event listener for the popup window', () => {
		expect( PopupMonitor.prototype.on ).toHaveBeenCalledWith( 'message', expect.any( Function ) );
	} );
} );
