import {
	getAreJetpackCredentialsInvalid,
	isRequestingJetpackCredentialsTest,
} from 'calypso/state/jetpack/credentials/selectors';
import { sites as SITES_CREDENTIALS_FIXTURE } from 'calypso/state/selectors/test/fixtures/jetpack-credentials-test-status';

describe( 'selectors', () => {
	describe( 'getAreJetpackCredentialsInvalid()', () => {
		test( 'should return false when when siteId not exists in state', () => {
			const stateIn = {
				jetpack: {
					credentials: {
						testStatus: SITES_CREDENTIALS_FIXTURE,
					},
				},
			};

			const siteId = 9990000;
			const role = 'main';

			const output = getAreJetpackCredentialsInvalid( stateIn, siteId, role );
			expect( output ).toEqual( false );
		} );

		test( 'should return false when test status is valid', () => {
			const stateIn = {
				jetpack: {
					credentials: {
						testStatus: SITES_CREDENTIALS_FIXTURE,
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
						testStatus: SITES_CREDENTIALS_FIXTURE,
					},
				},
			};

			const siteId = 3450000;
			const role = 'main';

			const output = getAreJetpackCredentialsInvalid( stateIn, siteId, role );
			expect( output ).toEqual( true );
		} );
	} );

	describe( 'isRequestingJetpackCredentialsTest()', () => {
		test( 'should return false when we have no credentials test request for a siteId and role', () => {
			const stateIn = {
				jetpack: {
					credentials: {
						testRequestStatus: {},
					},
				},
			};

			const output = isRequestingJetpackCredentialsTest( stateIn, 123000, 'main' );
			expect( output ).toEqual( false );
		} );

		test( 'should return false when we have a false value for a siteId and role', () => {
			const stateIn = {
				jetpack: {
					credentials: {
						testRequestStatus: {
							123000: {
								main: false,
							},
						},
					},
				},
			};

			const output = isRequestingJetpackCredentialsTest( stateIn, 123000, 'main' );
			expect( output ).toEqual( false );
		} );

		test( 'should return true when we have a true value for a siteId and role', () => {
			const stateIn = {
				jetpack: {
					credentials: {
						testRequestStatus: {
							123000: {
								main: true,
							},
						},
					},
				},
			};

			const output = isRequestingJetpackCredentialsTest( stateIn, 123000, 'main' );
			expect( output ).toEqual( true );
		} );
	} );
} );
