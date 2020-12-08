/**
 * External dependencies
 */

import { omit, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import { NOTICE_CREATE, NOTICE_REMOVE, ROUTE_SET } from 'calypso/state/action-types';
import { combineReducers, withoutPersistence } from 'calypso/state/utils';

export const items = withoutPersistence( ( state = {}, action ) => {
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
} );

export const lastTimeShown = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case NOTICE_CREATE: {
			const { notice } = action;
			return {
				...state,
				[ notice.noticeId ]: Date.now(),
			};
		}
	}

	return state;
} );

export default combineReducers( {
	items,
	lastTimeShown,
} );
