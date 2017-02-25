
import { translate } from 'i18n-calypso';

export const getCurrentLyric = ( lyrics ) => ( reduxState ) => {
	const index = reduxState.helloDolly || 0;

	return lyrics[ index % lyrics.length ] || translate( 'I can\'t think of a song to sing.' );
};

