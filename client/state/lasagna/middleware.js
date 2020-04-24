/**
 * External Dependencies
 */
import Lasagna from '@automattic/lasagna';

/**
 * Internal dependencies
 */
import config from 'config';
import wpcom from 'lib/wp';
import connectMiddleware from './connect/middleware';
import postChannelMiddleware from './post-channel/middleware';
import userChannelMiddleware from './user-channel/middleware';

const jwtFetcher = ( jwtType, { params } ) => {
	return wpcom
		.request( {
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: '/lasagna/jwt/sign',
			body: { payload: params },
		} )
		.then( ( { jwt } ) => jwt );
};

export const lasagna = new Lasagna( jwtFetcher, config( 'lasagna_url' ) );

/**
 * Compose a list of middleware into one middleware
 * Props @rhc3
 *
 * @param m middlewares to compose
 */
const combineMiddleware = ( ...m ) => {
	return ( store ) => {
		const initialized = m.map( ( middleware ) => middleware( store ) );
		return ( next ) => initialized.reduce( ( chain, mw ) => mw( chain ), next );
	};
};

export default combineMiddleware( connectMiddleware, userChannelMiddleware, postChannelMiddleware );
