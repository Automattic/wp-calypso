import { shuffle } from '@automattic/js-utils';
import { useMemo } from 'react';

// Shuffle order of blog posts to avoid repetition in previews
const shufflePostOrder = ( blogPostCount: number ) =>
	shuffle( [ ...Array( blogPostCount ).keys() ] );

// Memoize order per pattern to show same order in previews
const inlineCssByPatternId: { [ key: string ]: string } = {};

// Memoize last order
let lastPostOrder: number[] = [];

const usePatternInlineCss = ( patternId: string, patternHtml: string, isNewSite: boolean ) => {
	return useMemo( () => {
		const hasGrid = patternHtml?.includes( 'is-layout-grid' );
		const blogPostCount = patternHtml?.match( /wp-block-post /g )?.length ?? 0;

		// Only for patterns with a grid of posts in newly created sites
		if ( ! isNewSite || ! hasGrid || blogPostCount <= 1 ) {
			return undefined;
		}

		// Return memoized order
		let inlineCss = inlineCssByPatternId[ patternId ] || '';
		if ( inlineCss ) {
			return inlineCss;
		}

		// Shuffle post order
		let postOrder = shufflePostOrder( blogPostCount );

		// Prevent repeating the last order shuffling once more
		if ( lastPostOrder.toString() === postOrder.toString() ) {
			postOrder = shufflePostOrder( blogPostCount );
		}

		// Create CSS rules
		postOrder.forEach( ( order, index ) => {
			const childIndex = index + 1;
			const shuffledOrder = order + 1;
			inlineCss += `.is-layout-grid > .wp-block-post:nth-child(${ childIndex }) { order: ${ shuffledOrder }; }`;
		} );

		// Memoize
		inlineCssByPatternId[ patternId ] = inlineCss;
		lastPostOrder = postOrder;

		return inlineCss;
	}, [ patternId, patternHtml ] );
};

export default usePatternInlineCss;
