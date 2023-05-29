export const createCustomHomeTemplateContent = (
	stylesheet: string,
	hasHeader: boolean,
	hasFooter: boolean,
	hasSections: boolean,
	mainHtml = ''
): string => {
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
		${ mainHtml }
	</main>
<!-- /wp:group -->` );
	}

	if ( hasFooter ) {
		content.push(
			`<!-- wp:template-part {"slug":"footer","tagName":"footer","theme":"${ stylesheet }","className":"site-footer-container"} /-->`
		);
	}

	return content.join( '\n' );
};
