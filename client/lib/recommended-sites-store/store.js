import Dispatcher from 'dispatcher';
import { OrderedSet, fromJS } from 'immutable';
import pick from 'lodash/pick';

import Emitter from 'lib/mixins/emitter';
import { ACTION_RECEIVE_SITE_RECOMMENDATIONS, ACTION_RECEIVE_SITE_RECOMMENDATIONS_ERROR } from './constants';

let recommendations = OrderedSet(),
	page = 1,
	isLastPage = false;

const store = {
	_reset() {
		recommendations = OrderedSet();
		page = 1;
		isLastPage = false;
	},
	maxRecommendations() {
		return 100;
	},
	get() {
		return recommendations.toJS();
	},
	getPage() {
		return page;
	},
	isLastPage() {
		return isLastPage;
	},
	setIsLastPage( value ) {
		isLastPage = !! value;
	}
};

function receiveRecommendations( data ) {
	// consume the recommendations
	const previousRecs = recommendations;
	if ( data && data.blogs ) {
		if ( data.blogs.length === 0 ) {
			store.setIsLastPage( true );
			store.emit( 'change' );
			return;
		}
		const pruned = data.blogs.map( function( blog ) {
			return pick( blog, [ 'blog_id', 'follow_reco_id', 'reason' ] );
		} );

		recommendations = recommendations.union( fromJS( pruned ) );

		if ( recommendations !== previousRecs ) {
			if ( recommendations.count() >= store.maxRecommendations() ) {
				store.setIsLastPage( true );
			}
			page++;
			store.emit( 'change' );
		}
	}
}

function receiveError( /*error*/ ) {

}

Emitter( store ); // eslint-disable-line new-cap

store.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload && payload.action;

	switch ( action.type ) {
		case ACTION_RECEIVE_SITE_RECOMMENDATIONS:
			receiveRecommendations( action.data );
			break;
		case ACTION_RECEIVE_SITE_RECOMMENDATIONS_ERROR:
			receiveError( action.error );
			break;
	}
} );

export default store;
