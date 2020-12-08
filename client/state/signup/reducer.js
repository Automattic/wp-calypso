/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import dependencyStore from './dependency-store/reducer';
import progress from './progress/reducer';
import optionalDependencies from './optional-dependencies/reducer';
import steps from './steps/reducer';
import flow from './flow/reducer';
import verticals from './verticals/reducer';
import preview from './preview/reducer';

export default withStorageKey(
	'signup',
	combineReducers( {
		dependencyStore,
		optionalDependencies,
		progress,
		steps,
		flow,
		verticals,
		preview,
	} )
);
