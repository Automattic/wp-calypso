import { get } from 'lodash';

import 'calypso/state/concierge/init';

export default ( state ) => {
	return get( state, 'concierge.conciergeSites', [] );
};
