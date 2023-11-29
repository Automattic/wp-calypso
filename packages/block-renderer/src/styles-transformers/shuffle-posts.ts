// Memoize order per pattern to show same order in previews
const inlineCssByPatternId: { [ key: string ]: string } = {};

// Memoize last offset
let lastOffset = 0;

// Shuffles the order of posts so that the featured images don't look too repetitive between patterns
// when multiple "blog" patterns are shown in a list.
const shufflePosts = ( patternId: string, patternHtml: string ) => {
	const hasGrid = patternHtml?.includes( 'is-layout-grid' );
	const blogPostCount = patternHtml?.match( /wp-block-post /g )?.length ?? 0;

	// Only for patterns with a grid of posts in newly created sites
	if ( ! hasGrid || blogPostCount <= 1 ) {
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
