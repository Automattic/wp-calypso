import getPluginUploadError from 'calypso/state/selectors/get-plugin-upload-error';

const siteId = 77203074;
const error = {
	error: 'folder_exists',
	message: 'folder_exists',
};

describe( 'getPluginUploadError', () => {
	test( 'should return null by default', () => {
		const state = {
			plugins: {
				upload: {
					uploadError: {},
				},
			},
		};
		expect( getPluginUploadError( state, siteId ) ).toBeNull();
	} );

	test( 'should return current value for site', () => {
		const state = {
			plugins: {
				upload: {
					uploadError: {
						[ siteId ]: error,
					},
				},
			},
		};
		expect( getPluginUploadError( state, siteId ) ).toEqual( error );
	} );
} );
