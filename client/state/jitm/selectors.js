/**
 * External dependencies
 */
import { get } from 'lodash';

export function getJITM( state ) {
	return get( state, 'jitm.jitms.data', [] );
}

export function getTopJITM( state ) {
	const jitms = getJITM( state );

	if ( jitms.length === 0 ) {
		return null;
	}

	return jitms[ 0 ];
}
