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
	on: jest.fn(),
	getScreenCenterSpecs: jest.fn( () => '<screenSpecs>' ),
};

PopupMonitor.mockImplementation( () => ( { ...popupMonitorMocks } ) );

describe( 'requestExternalAccess', () => {
	const serviceURL = 'http://example.com';
	const callback = jest.fn();

	beforeEach( () => {
		requestExternalAccess( serviceURL, callback );
	} );

	afterEach( () => {
		Object.values( popupMonitorMocks ).forEach( ( fn ) => fn.mockClear() );
		callback.mockClear();
	} );

	afterAll( () => {
		PopupMonitor.mockReset();
	} );

	test( 'sets the popup "open" event listener with correct params', () => {
		expect( popupMonitorMocks.open ).toHaveBeenCalledWith(
			'http://example.com',
			null,
			'toolbar=0,location=0,status=0,menubar=0,<screenSpecs>'
		);
	} );

	test( 'calls for correct popup screen center specs', () => {
		expect( popupMonitorMocks.getScreenCenterSpecs ).toHaveBeenCalledWith( 780, 700 );
	} );

	test( 'sets the popup "close" event listener with correct params', () => {
		expect( popupMonitorMocks.once ).toHaveBeenCalledWith( 'close', expect.any( Function ) );
	} );

	test( 'sets the popup "message" event listener with correct params', () => {
		expect( popupMonitorMocks.on ).toHaveBeenCalledWith( 'message', expect.any( Function ) );
	} );

	describe( 'on popup close', () => {
		let popupMessageCallback;
		let popupCloseCallback;

		beforeEach( () => {
			popupMessageCallback = popupMonitorMocks.on.mock.calls[ 0 ][ 1 ];
			popupCloseCallback = popupMonitorMocks.once.mock.calls[ 0 ][ 1 ];
		} );

		test( 'calls the callback with result object containing correct entries if keyring_id is available', () => {
			popupMessageCallback( {
				keyring_id: '123',
				id_token: 'abc123',
				user: {
					name: 'Foo',
				},
			} );
			popupCloseCallback();

			expect( callback ).toHaveBeenCalledWith( {
				keyring_id: 123,
				id_token: 'abc123',
				user: {
					name: 'Foo',
				},
			} );
		} );

		test( 'calls the callback with empty result object if keyring_id is unavailable', () => {
			popupMessageCallback( {
				keyring_id: undefined,
			} );
			popupCloseCallback();

			expect( callback ).toHaveBeenCalledWith( {} );
		} );

		test( 'calls the callback with empty result object if message object is unavailable', () => {
			popupMessageCallback( undefined );
			popupCloseCallback();

			expect( callback ).toHaveBeenCalledWith( {} );
		} );
	} );
} );
