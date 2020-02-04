/**
 * External dependencies
 */
import proxy from 'wpcom-proxy-request';

let isAuthorized = false;

const authorize = () => {
	return new Promise( ( resolve, reject ) => {
		// TODO: if there is an in-progress authorisation, don't try and authorise, instead wait until it is resolved
		if ( isAuthorized ) {
			resolve();
			return;
		}
		proxy( { metaAPI: { accessAllUsersBlogs: true } }, ( error: Error ) => {
			if ( error ) {
				reject( error );
			} else {
				isAuthorized = true;
				resolve();
			}
		} );
	} );
};

const request = ( method: string, path: string, data?: any ): Promise< any > => {
	return new Promise( ( resolve, reject ) => {
		proxy(
			{
				method,
				path,
				formData: data,
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			( error: any, body: any ) => {
				if ( error ) {
					reject( error );
					return;
				}
				resolve( body );
			}
		);
	} );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetch = async ( method: string, path: string, data?: any ): Promise< any > => {
	await authorize();
	return await request( method, path, data );
};
