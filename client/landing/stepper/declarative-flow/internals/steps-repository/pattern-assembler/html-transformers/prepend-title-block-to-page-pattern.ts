export default function prependTitleBlockToPagePattern( patternHtml: string, pageTitle: string ) {
	// A copy of the title block in Creatio 2's page.html.
	const titleBlock = `
		<div
			class="wp-block-group has-global-padding is-layout-constrained wp-block-group-is-layout-constrained"
			style="margin-top:var(--wp--preset--spacing--60);margin-bottom:var(--wp--preset--spacing--60)"
		>
			<h2 class="has-text-align-left alignwide wp-block-post-title has-xxxx-large-font-size">
				${ pageTitle }
			</h2>
		</div>
	`;
	return titleBlock + patternHtml;
}
