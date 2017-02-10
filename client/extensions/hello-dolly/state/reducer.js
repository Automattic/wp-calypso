/**
 * Internal dependencies
 */
import lyrics from './lyrics';
import {
	HELLO_DOLLY_NEXT_LYRIC,
} from './action-types';

const initialState = {
	lyricIndex: 0
};

export default function( state = initialState, action ) {
	switch ( action.type ) {
		case HELLO_DOLLY_NEXT_LYRIC:
			return advanceToNextLyric( state );
		default:
			return state;
	}
}

function advanceToNextLyric( state ) {
	const { lyricIndex } = state;
	const newIndex = ( lyricIndex + 1 ) % lyrics.length;

	return {
		...state,
		lyricIndex: newIndex,
	};
}
