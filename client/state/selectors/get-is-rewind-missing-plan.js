/**
 * Internal dependencies
 */
import getRewindState from 'state/selectors/get-rewind-state';

const getIsRewindMissingPlan = ( state, siteId ) => {
	const rewindState = getRewindState( state, siteId );
	return rewindState.state === 'unavailable' && rewindState.reason === 'missing_plan';
};

export default getIsRewindMissingPlan;
