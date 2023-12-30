import {
	areJetpackCredentialsInvalid,
	isRequestingJetpackCredentialsTest,
	hasJetpackCredentials,
} from 'calypso/state/jetpack/credentials/selectors';
import { sites as SITES_CREDENTIALS_FIXTURE } from 'calypso/state/selectors/test/fixtures/jetpack-credentials-test-status';

describe( 'selectors', () => {
	describe( 'areJetpackCredentialsInvalid()', () => {
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

			const output = areJetpackCredentialsInvalid( stateIn, siteId, role );
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

			const output = areJetpackCredentialsInvalid( stateIn, siteId, role );
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

			const output = areJetpackCredentialsInvalid( stateIn, siteId, role );
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

	describe( 'hasJetpackCredentials()', () => {
		test( 'should return false when siteId does not exists in state', () => {
			const stateIn = {
				jetpack: {
					credentials: {
						items: {},
					},
				},
			};

			const siteId = 9990000;
			const role = 'main';

			const output = hasJetpackCredentials( stateIn, siteId, role );
			expect( output ).toEqual( false );
		} );

		test( 'should return false when role main does not exists in state', () => {
			const stateIn = {
				jetpack: {
					credentials: {
						items: {
							9990000: {
								staging: {},
							},
						},
					},
				},
			};

			const siteId = 9990000;
			const role = 'main';

			const output = hasJetpackCredentials( stateIn, siteId, role );
			expect( output ).toEqual( false );
		} );

		test( 'should return false when role exists in state but has no content', () => {
			const stateIn = {
				jetpack: {
					credentials: {
						items: {
							9990000: {
								main: {},
							},
						},
					},
				},
			};

			const siteId = 9990000;
			const role = 'main';

			const output = hasJetpackCredentials( stateIn, siteId, role );
			expect( output ).toEqual( false );
		} );

		test( 'should return true when role exists in state', () => {
			const stateIn = {
				jetpack: {
					credentials: {
						items: {
							9990000: {
								main: {
									user: 'test',
									// other properties not needed for this test
								},
							},
						},
					},
				},
			};

			const siteId = 9990000;
			const role = 'main';

			const output = hasJetpackCredentials( stateIn, siteId, role );
			expect( output ).toEqual( true );
		} );
	} );
} );
