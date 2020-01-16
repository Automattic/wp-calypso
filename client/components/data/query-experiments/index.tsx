/**
 * External Dependencies
 */

import { useEffect, FunctionComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { fetchExperiments } from 'state/experiments/actions';
import { getAnonId, nextRefresh } from 'state/experiments/selectors';
import { AppState } from 'types';

type QueryProps = {
	doFetchExperiments: typeof fetchExperiments;
	updateAfter: number;
	anonId: string;
};

const QueryExperiments: FunctionComponent< QueryProps > = ( {
	updateAfter,
	doFetchExperiments,
	anonId,
} ) => {
	useEffect( () => {
		if ( updateAfter < Date.now() ) doFetchExperiments( anonId );
	}, [ updateAfter, doFetchExperiments, anonId ] );

	return null;
};

const mapStateToProps = ( state: AppState ) => ( {
	updateAfter: nextRefresh( state ),
	anonId: getAnonId( state ),
} );

export default connect( mapStateToProps, { doFetchExperiments: fetchExperiments } )(
	QueryExperiments
);
