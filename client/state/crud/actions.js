/** @format */
/**
 * External dependencies
 */
import { startsWith } from 'lodash';

/*
 * Action types
 */
const PREFIX = '@@crud/';

export const CRUD_REPLACE = PREFIX + 'REPLACE';
export const CRUD_CREATE_OR_UPDATE = PREFIX + 'CREATE_OR_UPDATE';
export const CRUD_DELETE = PREFIX + 'DELETE';

export function isCrudAction( action ) {
	return action && startsWith( action.type, PREFIX );
}

/*
 * Action creators
 */
export default path => ( {
	replace( items, rest ) {
		return {
			type: CRUD_REPLACE,
			path,
			items,
			...rest,
		};
	},

	createOrUpdate( item, rest ) {
		return {
			type: CRUD_CREATE_OR_UPDATE,
			path,
			item,
			...rest,
		};
	},

	delete( itemId, rest ) {
		return {
			type: CRUD_DELETE,
			path,
			itemId,
			...rest,
		};
	},
} );
