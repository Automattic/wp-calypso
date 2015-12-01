/**
 * External Dependencies
 */
var React = require( 'react/addons' );

/**
 * Internal Dependencies
 */
var warn = require( 'lib/warn' ),
	tokenize = require( './tokenize.js' );

var currentTranslation;

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
			throw new Error( 'Invalid translation, missing component node: `' + token.value + '`' );
		}
		// should be either ReactElement or null (both type "object"), all other types deprecated
		if ( typeof components[ token.value ] !== 'object' ) {
			warn( 'Invalid translation, component node must be a ReactElement or null: `' + token.value + '`', '\n> ' + currentTranslation );
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

	children.forEach( function( child, index ) {
		if ( child ) {
			childrenObject[ 'translation-child-' + index ] = child;
		}
	} );

	return React.addons.createFragment( childrenObject );
}

module.exports = function interpolate( options ) {
	var translation = options.translation,
		components = options.components,
		throwErrors = options.throwErrors,
		tokens;

	currentTranslation = translation;

	if ( ! components ) {
		return translation;
	}

	if ( typeof components !== 'object' ) {
		warn( 'Translation Error: components argument must be an object', translation, components );
		return translation;
	}

	tokens = tokenize( translation );

	try {
		return buildChildren( tokens, components );
	} catch( error ) {
		// don't mess around in production, just return what we can
		if ( ! throwErrors ) {
			return translation;
		}
		// in pre-production environments we should make errors very visible
		if ( window && window.console && window.console.error ) {
			window.console.error( '\nTranslation Error: ', interpolate.caller.caller, '\n> ' + translation );
		}

		throw error;
	}
};
