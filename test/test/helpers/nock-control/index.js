import nock from 'nock';

export function allowNetworkAccess() {
	beforeAll( function enableNockNetworkConnect() {
		nock.enableNetConnect();
	} );

	afterAll( function disableNockNetworkConnect() {
		nock.disableNetConnect();
	} );
}
