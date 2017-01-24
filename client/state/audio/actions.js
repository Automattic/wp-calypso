
/**
 * Internal dependencies
 */
import {
	AUDIO_PLAY,
} from 'state/action-types';

export function audioPlay( reference ) {
	return {
		type: AUDIO_PLAY,
		reference,
	};
}
