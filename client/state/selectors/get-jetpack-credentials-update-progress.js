/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack/init';
import { CredentialsTestProgress } from '../data-layer/wpcom/activity-log/update-credentials/vendor';

export default function getJetpackCredentialsUpdateProgress( state, siteId ) {
	return new CredentialsTestProgress.Parser(
		...get( state, [ 'jetpack', 'credentials', 'progressUpdates', siteId ], [] )
	);
}
