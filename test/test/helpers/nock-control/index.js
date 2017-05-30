import nock from 'nock';

export function allowNetworkAccess() {
	before( function enableNockNetworkConnect() {
		nock.enableNetConnect();
	} );

	after( function disableNockNetworkConnect() {
		nock.disableNetConnect();
	} );
}
