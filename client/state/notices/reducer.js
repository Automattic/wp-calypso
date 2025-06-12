import { withStorageKey } from '@automattic/state-utils';
import { omit, reduce } from 'lodash';
import { NOTICE_CREATE, NOTICE_REMOVE, ROUTE_SET } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case NOTICE_CREATE: {
			const { notice } = action;
			return {
				...state,
				[ notice.noticeId ]: notice,
			};
		}
		case NOTICE_REMOVE: {
			const { noticeId } = action;
			if ( ! state.hasOwnProperty( noticeId ) ) {
				return state;
			}

			return omit( state, noticeId );
		}
		case ROUTE_SET: {
			return reduce(
				state,
				( memo, notice, noticeId ) => {
					if ( ! notice.isPersistent && ! notice.displayOnNextPage ) {
						return memo;
					}

					let nextNotice = notice;
					if ( nextNotice.displayOnNextPage ) {
						nextNotice = {
							...nextNotice,
							displayOnNextPage: false,
						};
					}

					memo[ noticeId ] = nextNotice;
					return memo;
				},
				{}
			);
		}
	}

	return state;
};

const combinedReducer = combineReducers( {
	items,
} );

export default withStorageKey( 'notices', combinedReducer );
