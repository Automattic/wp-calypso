
/**
 * Internal dependencies
 */
import {
	AUDIO_PLAY,
} from 'state/action-types';

export function audioPlay( sprite ) {
	return {
		type: AUDIO_PLAY,
		sprite,
	};
}
