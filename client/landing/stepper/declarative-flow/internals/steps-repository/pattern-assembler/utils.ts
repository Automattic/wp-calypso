import { addQueryArgs } from '@wordpress/url';
import { PATTERN_SOURCE_SITE_ID, PREVIEW_PATTERN_URL } from './constants';

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
	siteTitle: string;
	stylesheet: string | undefined;
} ) => {
	return addQueryArgs( PREVIEW_PATTERN_URL, {
		pattern_id: encodePatternId( id ),
		language,
		site_title: siteTitle,
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
	hasFooter: boolean
) {
	const content: string[] = [];

	if ( hasHeader ) {
		content.push(
			`<!-- wp:template-part {"slug":"header","tagName":"header","theme":"${ stylesheet }"} /-->`
		);
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
	}

	return content.join( '\n' );
}
