import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import dependencyStore from './dependency-store/reducer';
import flow from './flow/reducer';
import optionalDependencies from './optional-dependencies/reducer';
import progress from './progress/reducer';
import steps from './steps/reducer';
import verticals from './verticals/reducer';

export default withStorageKey(
	'signup',
	combineReducers( {
		dependencyStore,
		optionalDependencies,
		progress,
		steps,
		flow,
		verticals,
	} )
);
