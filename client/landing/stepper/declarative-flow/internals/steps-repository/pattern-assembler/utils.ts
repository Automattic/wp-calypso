import { addQueryArgs } from '@wordpress/url';
import { PATTERN_SOURCE_SITE_ID } from './constants';

const stylesheet = 'pub/blank-canvas';
const publicApiUrl = 'https://public-api.wordpress.com';
const patternPreviewUrl = publicApiUrl + '/wpcom/v2/block-previews/pattern';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;

export const getPatternPreviewUrl = ( id: number, language: string ) => {
	return addQueryArgs( patternPreviewUrl, {
		stylesheet,
		pattern_id: encodePatternId( id ),
		language,
	} );
};

// Runs the callback if the keys Enter or Spacebar are in the keyboard event
export const handleKeyboard =
	( callback: () => void ) =>
	( { key }: { key: string } ) => {
		if ( key === 'Enter' || key === ' ' ) callback();
	};
