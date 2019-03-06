/**
 * External Dependencies
 */
import { get } from 'lodash';

export const JETPACK_DATA_PATH = 'Jetpack_Editor_Initial_State';

export default function getJetpackData() {
	return get( 'object' === typeof window ? window : null, [ JETPACK_DATA_PATH ], null );
}
