import '../init';

import { get } from 'lodash';
import shouldCalypsoifyJetpack from 'calypso/state/selectors/should-calypsoify-jetpack';

export const isCoreFSEActive = ( state, siteId ) => {
	return (
		shouldCalypsoifyJetpack( state, siteId ) &&
		get( state, [ 'gutenbergFSESettings', siteId, 'isCoreFSEActive' ], false )
	);
};

export default isCoreFSEActive;
