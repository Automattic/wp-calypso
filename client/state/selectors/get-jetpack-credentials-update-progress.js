import { get } from 'lodash';
import { CredentialsTestProgress } from '../data-layer/wpcom/activity-log/update-credentials/vendor';
import 'calypso/state/jetpack/init';

export default function getJetpackCredentialsUpdateProgress( state, siteId ) {
	// This is O(n²) over n updates, but even the worst update attempts have < 50 updates, and I
	// don’t know how to avoid this without rewriting the state machine as a Redux reducer.
	return new CredentialsTestProgress.Parser(
		...get( state, [ 'jetpack', 'credentials', 'progressUpdates', siteId ], [] )
	);
}
