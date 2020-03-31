/**
 * Internal dependencies
 */
import { PRESENCE_META_SET } from 'state/action-types';
import 'state/presence/init';

export const setPresenceMeta = ( entity, uid, meta ) => ( {
	type: PRESENCE_META_SET,
	entity,
	uid,
	meta,
} );
