/**
 * External Dependencies
 */
import React from 'react';
import createFragment from 'react-addons-create-fragment';

/**
 * Internal Dependencies
 */
import tokenize from './tokenize';

let currentMixedString;

function getCloseIndex( openIndex, tokens ) {
	var openToken = tokens[ openIndex ],
		nestLevel = 0,
		token, i;
	for ( i = openIndex + 1; i < tokens.length; i++ ) {
		token = tokens[ i ];
		if ( token.value === openToken.value ) {
			if ( token.type === 'componentOpen' ) {
				nestLevel++;
				continue;
			}
			if ( token.type === 'componentClose' ) {
				if ( nestLevel === 0 ) {
					return i;
				}
				nestLevel--;
			}
		}
	}
	// if we get this far, there was no matching close token
	throw new Error( 'Missing closing component token `' + openToken.value + '`' );
}

function buildChildren( tokens, components ) {
	var children = [],
		childrenObject = {},
		openComponent, clonedOpenComponent, openIndex, closeIndex, token, i, grandChildTokens, grandChildren, siblingTokens, siblings;

	for ( i = 0; i < tokens.length; i++ ) {
		token = tokens[ i ];
		if ( token.type === 'string' ) {
			children.push( token.value );
			continue;
		}
		// component node should at least be set
		if ( ! components.hasOwnProperty( token.value ) || typeof components[ token.value ] === 'undefined' ) {
			throw new Error( 'Invalid interpolation, missing component node: `' + token.value + '`' );
		}
		// should be either ReactElement or null (both type "object"), all other types deprecated
		if ( typeof components[ token.value ] !== 'object' ) {
			throw new Error( 'Invalid interpolation, component node must be a ReactElement or null: `' + token.value + '`', '\n> ' + currentMixedString );
		}
		// we should never see a componentClose token in this loop
		if ( token.type === 'componentClose' ) {
			throw new Error( 'Missing opening component token: `' + token.value + '`' );
		}
		if ( token.type === 'componentOpen' ) {
			openComponent = components[ token.value ];
			openIndex = i;
			break;
		}
		// componentSelfClosing token
		children.push( components[ token.value ] );
		continue;
	}

	if ( openComponent ) {
		closeIndex = getCloseIndex( openIndex, tokens );
		grandChildTokens = tokens.slice( ( openIndex + 1 ), closeIndex );
		grandChildren = buildChildren( grandChildTokens, components );
		clonedOpenComponent = React.cloneElement( openComponent, {}, grandChildren );
		children.push( clonedOpenComponent );

		if ( closeIndex < tokens.length - 1 ) {
			siblingTokens = tokens.slice( closeIndex + 1 );
			siblings = buildChildren( siblingTokens, components );
			children = children.concat( siblings );
		}
	}

	if ( children.length === 1 ) {
		return children[ 0 ];
	}

	children.forEach( ( child, index ) => {
		if ( child ) {
			childrenObject[ `interpolation-child-${index}` ] = child;
		}
	} );

	return createFragment( childrenObject );
}

function interpolate( options ) {
	const { mixedString, components, throwErrors } = options;

	currentMixedString = mixedString;

	if ( ! components ) {
		return mixedString;
	}

	if ( typeof components !== 'object' ) {
		if ( throwErrors ) {
			throw new Error( `Interpolation Error: unable to process \`${ mixedString }\` because components is not an object` );
		}

		return mixedString;
	}

	let tokens = tokenize( mixedString );

	try {
		return buildChildren( tokens, components );
	} catch ( error ) {
		if ( throwErrors ) {
			throw new Error( `Interpolation Error: unable to process \`${ mixedString }\` because of error \`${ error.message }\`` );
		}

		return mixedString;
	}
};

export default interpolate;
module.exports = tokenize;
