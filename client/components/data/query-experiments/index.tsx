/**
 * External Dependencies
 */

import { useEffect } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { fetchExperiments } from 'state/experiments/actions';
import { nextRefresh } from 'state/experiments/selectors';
import { AppState } from 'types';

function QueryExperiments( {
	doFetchExperiments,
	updateAfter,
}: {
	doFetchExperiments: typeof fetchExperiments;
	updateAfter: number;
} ) {
	useEffect( () => {
		// todo: wait until after `updateAfter` to call the function
		doFetchExperiments();
	}, [ updateAfter, doFetchExperiments ] );

	return null;
}

const mapStateToProps = ( state: AppState ) => ( {
	updateAfter: nextRefresh( state ),
} );

export default connect( mapStateToProps, { doFetchExperiments: fetchExperiments } )(
	QueryExperiments
);
