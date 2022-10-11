import { addQueryArgs } from '@wordpress/url';
import {
	PATTERN_SOURCE_SITE_ID,
	PREVIEW_PATTERN_URL,
	STYLE_SHEET,
	SITE_LOGO_URL,
} from './constants';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;

export const getPatternPreviewUrl = ( id: number, language: string ) => {
	return addQueryArgs( PREVIEW_PATTERN_URL, {
		stylesheet: STYLE_SHEET,
		pattern_id: encodePatternId( id ),
		language,
		site_logo_url: SITE_LOGO_URL,
	} );
};

// Runs the callback if the keys Enter or Spacebar are in the keyboard event
export const handleKeyboard =
	( callback: () => void ) =>
	( { key }: { key: string } ) => {
		if ( key === 'Enter' || key === ' ' ) callback();
	};
