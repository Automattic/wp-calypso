/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack/init';

interface Error {
	method: string;
	name: string;
	message: string;
	code: string;
}

const getJetpackCredentialsUpdateError = ( state: any, siteId: number | null ): Error | null => {
	return null !== siteId
		? get( state, [ 'jetpack', 'credentials', 'errors', siteId ], null )
		: null;
};

export default getJetpackCredentialsUpdateError;
