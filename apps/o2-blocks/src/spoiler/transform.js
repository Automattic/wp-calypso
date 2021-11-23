import { createBlock, rawHandler } from '@wordpress/blocks';

export const transforms = {
	from: [
		{
			type: 'raw',
			isMatch: ( node ) => node.nodeName === 'DETAILS' && node.querySelector( 'summary' ) !== null,
			schema: ( { phrasingContentSchema } ) => ( {
				details: {
					children: {
						...phrasingContentSchema,
						summary: { children: phrasingContentSchema },
					},
				},
			} ),
			transform( node ) {
				const summary = node.querySelector( 'summary' );
				node.removeChild( summary );

				return createBlock(
					'a8c/spoiler',
					{
						summary: summary.innerHTML,
					},
					rawHandler( { HTML: node.innerHTML } )
				);
			},
		},
	],
};
