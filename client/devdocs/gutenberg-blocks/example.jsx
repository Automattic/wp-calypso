/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { GutenbergBlock } from 'gutenberg-blocks';

const renderExample = ( { name, attributes, inner, level } ) => {
	const innerExamples = inner
		? inner.map( ( innerExample, index ) => {
				return renderExample( {
					...innerExample,
					level: `${ level || 0 }_${ index }`,
				} );
		  } )
		: null;

	return (
		<GutenbergBlock key={ level || '0' } name={ name } attributes={ attributes }>
			{ innerExamples }
		</GutenbergBlock>
	);
};

const GutenbergBlockExample = ( { name, attributes, inner } ) =>
	renderExample( { name, attributes, inner } );

export default GutenbergBlockExample;
