/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getConnectionsBySiteId,
	hasFetchedConnections,
	isFetchingConnections
} from '../selectors';

describe( '#getConnectionsBySiteId()', () => {
	it( 'should return an empty array for a site which has not yet been fetched', () => {
		const connections = getConnectionsBySiteId( {
			sharing: {
				publicize: {
					connectionsBySiteId: {},
					connections: {}
				}
			}
		}, 2916284 );

		expect( connections ).to.eql( [] );
	} );

	it( 'should return an array of connection objects received for the site', () => {
		const connections = getConnectionsBySiteId( {
			sharing: {
				publicize: {
					connectionsBySiteId: {
						2916284: [ 1, 2 ]
					},
					connections: {
						1: { ID: 1, site_ID: 2916284 },
						2: { ID: 2, site_ID: 2916284 }
					}
				}
			}
		}, 2916284 );

		expect( connections ).to.eql( [
			{ ID: 1, site_ID: 2916284 },
			{ ID: 2, site_ID: 2916284 }
		] );
	} );
} );

describe( '#hasFetchedConnections()', () => {
	it( 'should return false if connections have not been fetched for a site', () => {
		const hasFetched = hasFetchedConnections( {
			sharing: {
				publicize: {
					fetchingConnections: {}
				}
			}
		}, 2916284 );

		expect( hasFetched ).to.be.false;
	} );

	it( 'should return true if connections are currently fetching for a site', () => {
		const hasFetched = hasFetchedConnections( {
			sharing: {
				publicize: {
					fetchingConnections: {
						2916284: true
					}
				}
			}
		}, 2916284 );

		expect( hasFetched ).to.be.true;
	} );

	it( 'should return true if connections have completed fetching for a site', () => {
		const hasFetched = hasFetchedConnections( {
			sharing: {
				publicize: {
					fetchingConnections: {
						2916284: false
					}
				}
			}
		}, 2916284 );

		expect( hasFetched ).to.be.true;
	} );
} );

describe( '#isFetchingConnections()', () => {
	it( 'should return false if fetch has never been triggered for site', () => {
		const isFetching = isFetchingConnections( {
			sharing: {
				publicize: {
					fetchingConnections: {}
				}
			}
		}, 2916284 );

		expect( isFetching ).to.be.false;
	} );

	it( 'should return true if connections are currently fetching for a site', () => {
		const isFetching = isFetchingConnections( {
			sharing: {
				publicize: {
					fetchingConnections: {
						2916284: true
					}
				}
			}
		}, 2916284 );

		expect( isFetching ).to.be.true;
	} );

	it( 'should return false if connections are not currently fetching for a site', () => {
		const isFetching = isFetchingConnections( {
			sharing: {
				publicize: {
					fetchingConnections: {
						2916284: false
					}
				}
			}
		}, 2916284 );

		expect( isFetching ).to.be.false;
	} );

	it( 'should return false if connections are fetching, but not for the given site', () => {
		const isFetching = isFetchingConnections( {
			sharing: {
				publicize: {
					fetchingConnections: {
						77203074: true
					}
				}
			}
		}, 2916284 );

		expect( isFetching ).to.be.false;
	} );
} );
