import { addQueryArgs } from '@wordpress/url';
import {
	PATTERN_SOURCE_SITE_ID,
	PREVIEW_PATTERN_URL,
	STYLE_SHEET,
	CUSTOMIZED_HOME_PAGE_TEMPLATE_CONTENT,
} from './constants';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;

export const getPatternPreviewUrl = ( id: number, language: string ) => {
	return addQueryArgs( PREVIEW_PATTERN_URL, {
		stylesheet: STYLE_SHEET,
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

export const makeCustomizedHomePageTemplateContent = ( hasHeader: boolean, hasFooter: boolean ) =>
	[
		hasHeader && CUSTOMIZED_HOME_PAGE_TEMPLATE_CONTENT.HEADER,
		CUSTOMIZED_HOME_PAGE_TEMPLATE_CONTENT.MAIN,
		hasFooter && CUSTOMIZED_HOME_PAGE_TEMPLATE_CONTENT.FOOTER,
	]
		.filter( Boolean )
		.join( '\n' );
