/**
 * Internal Dependencies
 */
import lyrics from './lyrics';

export function getCurrentLyric( reduxState ) {
	const state = reduxState.helloDolly;

	return lyrics[ state.lyricIndex ];
}

