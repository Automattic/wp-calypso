// The eslint configuration below helps prevent new legacy reducers from being added.
// See `docs/modularized-state.md` to learn more about modularized state.

/*eslint no-restricted-imports: ["error", {
    "patterns": ["./*\/reducer*", "state/*\/reducer*"]
}]*/

import { combineReducers } from 'calypso/state/utils';
import currentUser from './current-user/reducer'; // eslint-disable-line no-restricted-imports
import { reducer as dataRequests } from './data-layer/wpcom-http/utils';
import sites from './sites/reducer'; // eslint-disable-line no-restricted-imports

// Legacy reducers
// The reducers in this list are not modularized, and are always loaded on boot.
// Please do not add to this list. See #39261 and p4TIVU-9lM-p2 for more details.
const reducers = {
	currentUser,
	dataRequests,
	sites,
};

export default combineReducers( reducers );
