import getJetpackCredentialsTestStatus from 'calypso/state/selectors/get-jetpack-credentials-test-status';
import { sites as SITES_CREDENTIALS_FIXTURE } from './fixtures/jetpack-credentials-test-status';

describe( 'getJetpackCredentialsTestStatus()', () => {
	test( 'should return credentials test is valid', () => {
		const stateIn = {
			jetpack: {
				credentials: {
					testRequestStatus: SITES_CREDENTIALS_FIXTURE,
				},
			},
		};
		const siteId = 2340000;
		const role = 'main';

		const output = getJetpackCredentialsTestStatus( stateIn, siteId, role );
		expect( output ).toEqual( SITES_CREDENTIALS_FIXTURE[ siteId ]?.[ role ] );
	} );

	test( 'should return credentials test is invalid', () => {
		const stateIn = {
			jetpack: {
				credentials: {
					testRequestStatus: SITES_CREDENTIALS_FIXTURE,
				},
			},
		};
		const siteId = 3450000;
		const role = 'main';

		const output = getJetpackCredentialsTestStatus( stateIn, siteId, role );
		expect( output ).toEqual( SITES_CREDENTIALS_FIXTURE[ siteId ]?.[ role ] );
	} );

	test( 'should return credentials test is pending', () => {
		const stateIn = {
			jetpack: {
				credentials: {
					testRequestStatus: SITES_CREDENTIALS_FIXTURE,
				},
			},
		};
		const siteId = 1230000;
		const role = 'main';

		const output = getJetpackCredentialsTestStatus( stateIn, siteId, role );
		expect( output ).toEqual( SITES_CREDENTIALS_FIXTURE[ siteId ]?.[ role ] );
	} );

	test( 'should return credentials test is pending when siteId not exists in state', () => {
		const stateIn = {
			jetpack: {
				credentials: {
					testRequestStatus: SITES_CREDENTIALS_FIXTURE,
				},
			},
		};
		const siteId = 9990000;
		const role = 'main';

		const output = getJetpackCredentialsTestStatus( stateIn, siteId, role );
		expect( output ).toEqual( 'pending' );
	} );
} );
