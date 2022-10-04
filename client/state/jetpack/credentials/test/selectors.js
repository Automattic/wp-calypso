import getAreJetpackCredentialsInvalid from 'calypso/state/jetpack/credentials/selectors';
import { sites as SITES_CREDENTIALS_FIXTURE } from 'calypso/state/selectors/test/fixtures/jetpack-credentials-test-status';

describe( 'getAreJetpackCredentialsInvalid()', () => {
	test( 'should return false when when siteId not exists in state', () => {
		const stateIn = {
			jetpack: {
				credentials: {
					testRequestStatus: SITES_CREDENTIALS_FIXTURE,
				},
			},
		};

		const siteId = 9990000;
		const role = 'main';

		const output = getAreJetpackCredentialsInvalid( stateIn, siteId, role );
		expect( output ).toEqual( false );
	} );

	test( 'should return false when test status is pending', () => {
		const stateIn = {
			jetpack: {
				credentials: {
					testRequestStatus: SITES_CREDENTIALS_FIXTURE,
				},
			},
		};

		const siteId = 1230000;
		const role = 'main';

		const output = getAreJetpackCredentialsInvalid( stateIn, siteId, role );
		expect( output ).toEqual( false );
	} );

	test( 'should return false when test status is valid', () => {
		const stateIn = {
			jetpack: {
				credentials: {
					testRequestStatus: SITES_CREDENTIALS_FIXTURE,
				},
			},
		};

		const siteId = 2340000;
		const role = 'main';

		const output = getAreJetpackCredentialsInvalid( stateIn, siteId, role );
		expect( output ).toEqual( false );
	} );

	test( 'should return true when test status is invalid', () => {
		const stateIn = {
			jetpack: {
				credentials: {
					testRequestStatus: SITES_CREDENTIALS_FIXTURE,
				},
			},
		};

		const siteId = 3450000;
		const role = 'main';

		const output = getAreJetpackCredentialsInvalid( stateIn, siteId, role );
		expect( output ).toEqual( true );
	} );
} );
