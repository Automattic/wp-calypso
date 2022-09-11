import { PATTERN_SOURCE_SITE_ID } from './constants';

const patternPreviewUrl =
	'https://public-api.wordpress.com/wpcom/v2/block-previews/pattern?stylesheet=pub/blank-canvas&pattern_id=';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;

export const getPatternPreviewUrl = ( id: number ) =>
	`${ patternPreviewUrl }${ encodePatternId( id ) }`;

// Runs the callback if the keys Enter or Spacebar are in the keyboard event
export const handleKeyboard =
	( callback: () => void ) =>
	( { key }: { key: string } ) => {
		if ( key === 'Enter' || key === ' ' ) callback();
	};
