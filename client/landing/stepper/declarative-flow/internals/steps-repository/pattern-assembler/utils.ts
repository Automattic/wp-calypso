import { PATTERN_SOURCE_SITE_ID } from './constants';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;

export function createCustomHomeTemplateContent(
	stylesheet: string,
	hasHeader: boolean,
	hasFooter: boolean,
	hasSections: boolean
) {
	const content: string[] = [];
	if ( hasHeader ) {
		content.push(
			`<!-- wp:template-part {"slug":"header","tagName":"header","theme":"${ stylesheet }"} /-->`
		);
	}

	if ( hasSections ) {
		content.push( `
	<!-- wp:group {"tagName":"main"} -->
		<main class="wp-block-group">
		</main>
	<!-- /wp:group -->` );
	}

	if ( hasFooter ) {
		content.push(
			`<!-- wp:template-part {"slug":"footer","tagName":"footer","theme":"${ stylesheet }","className":"site-footer-container"} /-->`
		);
	}

	return content.join( '\n' );
}
