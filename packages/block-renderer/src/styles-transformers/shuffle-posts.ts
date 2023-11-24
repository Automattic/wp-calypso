// Memoize order per pattern to show same order in previews
const inlineCssByPatternId: { [ key: string ]: string } = {};

// Memoize last offset
let lastOffset = 0;

const shufflePosts = ( patternId: string, patternHtml: string, shouldShufflePosts: boolean ) => {
	const hasGrid = patternHtml?.includes( 'is-layout-grid' );
	const blogPostCount = patternHtml?.match( /wp-block-post /g )?.length ?? 0;

	// Only for patterns with a grid of posts in newly created sites
	if ( ! shouldShufflePosts || ! hasGrid || blogPostCount <= 1 ) {
		return undefined;
	}

	// Return memoized order
	let inlineCss = inlineCssByPatternId[ patternId ] || '';
	if ( inlineCss ) {
		return inlineCss;
	}

	// Create CSS rules
	[ ...Array( blogPostCount ).keys() ].forEach( ( order, index ) => {
		const childIndex = index + 1;
		// Offset order of blog posts to avoid repetition in previews
		const offset = lastOffset % blogPostCount;
		const orderWithOffset = ( order - offset + blogPostCount ) % blogPostCount;
		inlineCss += `.is-layout-grid > .wp-block-post:nth-child(${ childIndex }) { order: ${ orderWithOffset }; }`;
	} );

	// Memoize
	inlineCssByPatternId[ patternId ] = inlineCss;
	lastOffset += 1;

	return inlineCss;
};

export default shufflePosts;
