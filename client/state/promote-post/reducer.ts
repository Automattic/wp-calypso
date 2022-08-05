import { withStorageKey } from '@automattic/state-utils';
import { AnyAction } from 'redux';
import {
	PROMOTE_POST_CAMPAIGNS_FETCH,
	PROMOTE_POST_CAMPAIGNS_FETCH_DONE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

type State = {
	[ siteId: number ]: {
		isFetching: boolean;
		campaigns: any;
	};
};

export function campaigns( state: State = {}, action: AnyAction ) {
	switch ( action.type ) {
		case PROMOTE_POST_CAMPAIGNS_FETCH:
			state = {
				...state,
				[ action.siteId ]: {
					...state[ action.siteId ],
					isFetching: true,
				},
			};
			break;
		case PROMOTE_POST_CAMPAIGNS_FETCH_DONE:
			state = {
				...state,
				[ action.siteId ]: {
					...state[ action.siteId ],
					isFetching: false,
					campaigns: action.campaigns,
				},
			};
			break;
	}
	return state;
}

const combinedReducer = combineReducers( {
	campaigns,
} );

export default withStorageKey( 'promotePost', combinedReducer );
