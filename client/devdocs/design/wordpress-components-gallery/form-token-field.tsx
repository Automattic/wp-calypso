/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { FormTokenField } from '@wordpress/components';
import { withState } from '@wordpress/compose';

const Example = withState( {
	tokens: [],
	suggestions: [
		'Africa',
		'North America',
		'South America',
		'Antarctica',
		'Asia',
		'Europe',
		'Oceania',
	],
} )( ( { tokens, suggestions, setState } ) => (
	<FormTokenField
		value={ tokens }
		suggestions={ suggestions }
		onChange={ ( nextTokens ) => setState( { tokens: nextTokens } ) }
		label="Type a continent"
	/>
) );

export default Example;
