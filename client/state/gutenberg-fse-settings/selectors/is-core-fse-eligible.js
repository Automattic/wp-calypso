import '../init';

import { get } from 'lodash';
import shouldCalypsoifyJetpack from 'calypso/state/selectors/should-calypsoify-jetpack';

export const isCoreFSEEligible = ( state, siteId ) => {
	return (
		shouldCalypsoifyJetpack( state, siteId ) &&
		get( state, [ 'gutenbergFSESettings', siteId, 'isCoreFSEEligible' ], false )
	);
};

export default isCoreFSEEligible;
