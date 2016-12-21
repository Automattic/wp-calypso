/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { get } from 'lodash';

/**
 * Matches an expression type
 *
 * @type {RegExp}
 */
const REGEXP_EXPRESSION_TYPE = /(.*)Type$/;

export default function DocsSelectorsParamType( { expression, name, type } ) {
	return (
		<div className="docs-selectors__param-type">
			<code>{ get( expression, 'name', name ) }</code>
			{ expression && REGEXP_EXPRESSION_TYPE.test( type ) && (
				<span>({ type.match( REGEXP_EXPRESSION_TYPE )[ 1 ] })</span>
			) }
		</div>
	);
}

DocsSelectorsParamType.propTypes = {
	expression: PropTypes.shape( {
		name: PropTypes.string
	} ),
	name: PropTypes.string,
	type: PropTypes.string
};
