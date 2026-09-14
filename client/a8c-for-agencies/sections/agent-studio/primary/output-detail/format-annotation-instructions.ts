/**
 * Serializes collected annotations into refine instructions, one per page
 * (the refine endpoint is page-scoped: it parses the page number out of the
 * instruction and dispatches one run per page). Each annotation carries its
 * element context (tag, visible text, selector) so the agent can locate the
 * element in the page HTML.
 */
import { __, sprintf } from '@wordpress/i18n';
import type { PageAnnotation } from './annotation-viewer';

const describeAnnotation = ( annotation: PageAnnotation, index: number ): string => {
	const nearbyText = annotation.nearbyText.trim();
	const target = nearbyText
		? sprintf(
				/* translators: %1$s is an HTML tag name, %2$s is the element's visible text. */
				__( 'the <%1$s> element containing “%2$s”' ),
				annotation.tag,
				nearbyText
		  )
		: sprintf(
				/* translators: %s is an HTML tag name. */
				__( 'the <%s> element' ),
				annotation.tag
		  );
	return sprintf(
		/* translators: %1$d is the note number, %2$s describes the annotated element, %3$s is its CSS selector, %4$s is the user's note. */
		__( '%1$d. In %2$s (CSS selector: `%3$s`): %4$s' ),
		index + 1,
		target,
		annotation.selector,
		annotation.comment
	);
};

/**
 * Groups annotations by page (ascending) and returns one refine instruction
 * per page, each led by the page-scoping phrase the refine endpoint expects.
 */
export function formatAnnotationInstructions( annotations: PageAnnotation[] ): string[] {
	const byPage = new Map< number, PageAnnotation[] >();
	for ( const annotation of annotations ) {
		const group = byPage.get( annotation.pageNumber ) ?? [];
		group.push( annotation );
		byPage.set( annotation.pageNumber, group );
	}

	return Array.from( byPage.entries() )
		.sort( ( [ a ], [ b ] ) => a - b )
		.map( ( [ pageNumber, group ] ) =>
			[
				sprintf(
					/* translators: %d is the 1-based page number, cover included. */
					__( 'On page %d, make the following edits:' ),
					pageNumber
				),
				...group.map( describeAnnotation ),
			].join( '\n' )
		);
}
