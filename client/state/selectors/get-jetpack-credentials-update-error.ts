/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack/init';
import { TransportError } from 'calypso/state/data-layer/wpcom/activity-log/update-credentials/vendor';

export interface UpdateError {
	wpcomError?: WpcomError;
	translatedError?: string;
	transportError?: TransportError;
}

interface WpcomError {
	method: string;
	name: string;
	message: string;
	code: string;
	data: any;
}

const getJetpackCredentialsUpdateError = (
	state: any,
	siteId: number | null
): UpdateError | null => {
	return null !== siteId
		? get( state, [ 'jetpack', 'credentials', 'errors', siteId ], null )
		: null;
};

export default getJetpackCredentialsUpdateError;
