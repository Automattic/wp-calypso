/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { GutenbergBlock } from 'gutenberg-blocks';

const generateExample = ( { name, attributes, inner, level } ) => {
	const innerExamples = inner
		? inner.map( ( innerExample, index ) => {
				return generateExample( {
					...innerExample,
					level: `${ level || 0 }_${ index }`,
				} );
		  } )
		: null;

	return (
		<GutenbergBlock key={ level } name={ name } attributes={ attributes }>
			{ innerExamples }
		</GutenbergBlock>
	);
};

const GutenbergBlockExample = ( { name, attributes, inner } ) =>
	generateExample( { name, attributes, inner } );

export { generateExample, GutenbergBlockExample };
