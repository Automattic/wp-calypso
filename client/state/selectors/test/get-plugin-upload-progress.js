import getPluginUploadProgress from 'calypso/state/selectors/get-plugin-upload-progress';

const siteId = 77203074;

describe( 'getPluginUploadProgress', () => {
	test( 'should return 0 by default', () => {
		const state = {
			plugins: {
				upload: {
					progressPercent: {},
				},
			},
		};
		expect( getPluginUploadProgress( state, siteId ) ).toEqual( 0 );
	} );

	test( 'should return current value for site', () => {
		const state = {
			plugins: {
				upload: {
					progressPercent: {
						[ siteId ]: 73,
					},
				},
			},
		};
		expect( getPluginUploadProgress( state, siteId ) ).toEqual( 73 );
	} );
} );
