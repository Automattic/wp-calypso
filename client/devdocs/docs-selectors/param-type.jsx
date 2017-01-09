/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { get, has, union } from 'lodash';

/** @type {RegExp} */
const ARRAY_TYPE_PATTERN = /^Array[.]<([^>]+)>/;

/** @type {RegExp} */
const OBJECT_TYPE_PATTERN = /^Object[.]<([^,]+), ([^>]+)>/;

/**
 * Returns a unified textual description of data types
 *
 * @param {String} name type name from JSDoc output
 * @returns {String} description of type
 */
const describeType = name => {
	/** @type {?String[]} */
	const arrayInfo = name.match( ARRAY_TYPE_PATTERN );

	if ( arrayInfo ) {
		const [ /* match */, type ] = arrayInfo;
		return `${ type }[]`;
	}

	/** @type {?String[]} */
	const objectInfo = name.match( OBJECT_TYPE_PATTERN );

	if ( objectInfo ) {
		const [ /* match */, keyType, valueType ] = objectInfo;
		return `{ ${ keyType }: ${ valueType } }`;
	}

	return name;
};

/**
 * Returns a new list with `element` between every existing list item
 *
 * @param {Array} list existing list of items
 * @param {*} element separator to insert between items
 * @returns {Array} new list with element interspersed between items
 */
const intersperse = ( list, element ) =>
	list
		.reduce( ( final, next ) => [ ...final, next, element ], [] )
		.slice( 0, -1 );

/**
 * @typedef {Object} ReactElement
 */

/**
 * Renders a JSDoc param type
 *
 * @param {?Boolean} nullable whether or not the parameter can have the value `null`
 * @param {String} type normalized string representation of JSDoc type
 * @returns {ReactElement} rendered ParamType React component
 */
export default function DocsSelectorsParamType( { nullable, type } ) {
	/** @type {String[]} **/
	const types = union(
		get( type, 'names', [] ),
		nullable ? [ 'null' ] : [],
	);

	return (
		<div className="docs-selectors__param-type">
			{ intersperse( types, { separator: 'or' } ).map( ( name, index ) => (
				has( name, 'separator' )
					? <div key={ index } className="docs-selectors__param-type-separator">{ name.separator }</div>
					: (
						<div key={ name }>
							{ describeType( name ) }
							{ false === nullable && <span className="docs-selectors__param-type-non-nullable">(not nullable)</span> }
						</div>
					)
			) ) }
		</div>
	);
}

DocsSelectorsParamType.propTypes = {
	nullable: PropTypes.bool,
	type: PropTypes.shape( { names: PropTypes.arrayOf( PropTypes.string ) } ),
};
