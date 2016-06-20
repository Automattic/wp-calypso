import get from 'lodash/get';
import isFunction from 'lodash/isFunction';

import {
	REQUIRE_POST
} from 'state/action-types';

import { fetchPost } from './posts/fetch-post';

const actionMap = {
	[ REQUIRE_POST ]: fetchPost
};

export const wpApiMiddleware = store => next => action => {
	const handler = get( actionMap, action.type );

	return isFunction( handler )
		? handler( store, action )
		: next( action );
};

export default wpApiMiddleware;
