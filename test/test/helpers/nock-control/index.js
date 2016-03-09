import nock from 'nock';

export function allowNetworkAccess() {
	before( () => {
		nock.enableNetConnect();
	} );

	after( () => {
		nock.disableNetConnect();
	} );
}
