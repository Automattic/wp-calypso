import { addQueryArgs } from '@wordpress/url';
import { PATTERN_SOURCE_SITE_ID, PREVIEW_PATTERN_URL, SITE_TAGLINE } from './constants';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;

export const getPatternPreviewUrl = ( {
	id,
	language,
	siteTitle,
	stylesheet,
}: {
	id: number;
	language: string;
	siteTitle?: string;
	stylesheet?: string;
} ) => {
	return addQueryArgs( PREVIEW_PATTERN_URL, {
		pattern_id: encodePatternId( id ),
		language,
		site_title: siteTitle,
		site_tagline: SITE_TAGLINE,
		stylesheet,
	} );
};

// Runs the callback if the keys Enter or Spacebar are in the keyboard event
export const handleKeyboard =
	( callback: () => void ) =>
	( { key }: { key: string } ) => {
		if ( key === 'Enter' || key === ' ' ) {
			callback();
		}
	};

export function createCustomHomeTemplateContent(
	stylesheet: string,
	hasHeader: boolean,
	hasFooter: boolean,
	hasSections: boolean
) {
	const content: string[] = [];
	const noSelection = ! hasHeader && ! hasFooter && ! hasSections;
	if ( hasHeader ) {
		content.push(
			`<!-- wp:template-part {"slug":"header","tagName":"header","theme":"${ stylesheet }"} /-->`
		);
	} else if ( noSelection ) {
		content.push( `<!-- wp:template-part {"area":"header","theme":"${ stylesheet }"} /-->` );
	}

	content.push( `
<!-- wp:group {"tagName":"main"} -->
	<main class="wp-block-group">
	</main>
<!-- /wp:group -->` );

	if ( hasFooter ) {
		content.push(
			`<!-- wp:template-part {"slug":"footer","tagName":"footer","theme":"${ stylesheet }","className":"site-footer-container"} /-->`
		);
	} else if ( noSelection ) {
		content.push( `<!-- wp:template-part {"area":"footer","theme":"${ stylesheet }"} /-->` );
	}

	return content.join( '\n' );
}
