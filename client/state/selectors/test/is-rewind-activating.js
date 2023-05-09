import deepFreeze from 'deep-freeze';
import isRewindActivating from 'calypso/state/selectors/is-rewind-activating';

const siteId = 77203074;

describe( 'isRewindActivating()', () => {
	test( 'should return false if no status exists for a site', () => {
		const stateNoSite = deepFreeze( {
			activityLog: {
				activationRequesting: {},
			},
		} );
		expect( isRewindActivating( stateNoSite, siteId ) ).toBe( false );

		const stateNoValue = deepFreeze( {
			activityLog: {
				activationRequesting: {
					[ siteId ]: null,
				},
			},
		} );
		expect( isRewindActivating( stateNoValue, siteId ) ).toBe( false );
	} );

	test( 'should return the value for a site', () => {
		const stateTrue = deepFreeze( {
			activityLog: {
				activationRequesting: {
					[ siteId ]: true,
				},
			},
		} );
		expect( isRewindActivating( stateTrue, siteId ) ).toBe( true );

		const stateFalse = deepFreeze( {
			activityLog: {
				activationRequesting: {
					[ siteId ]: false,
				},
			},
		} );

		expect( isRewindActivating( stateFalse, siteId ) ).toBe( false );
	} );
} );
