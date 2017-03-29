
/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import lyrics from './lyrics';

export const getCurrentLyric = ( lines ) => ( reduxState ) => {
	const index = reduxState.helloDolly || 0;

	return lines[ index % lines.length ] || translate( 'I can\'t think of a song to sing.' );
};

export default getCurrentLyric( lyrics );

