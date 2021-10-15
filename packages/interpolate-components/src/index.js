import { cloneElement, createElement, Fragment } from 'react';
import tokenize from './tokenize';

function getCloseIndex( openIndex, tokens ) {
	const openToken = tokens[ openIndex ];
	let nestLevel = 0;
	for ( let i = openIndex + 1; i < tokens.length; i++ ) {
		const token = tokens[ i ];
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
	let children = [];
	let openComponent;
	let openIndex;

	for ( let i = 0; i < tokens.length; i++ ) {
		const token = tokens[ i ];
		if ( token.type === 'string' ) {
			children.push( token.value );
			continue;
		}
		// component node should at least be set
		if ( components[ token.value ] === undefined ) {
			throw new Error( `Invalid interpolation, missing component node: \`${ token.value }\`` );
		}
		// should be either ReactElement or null (both type "object"), all other types deprecated
		if ( typeof components[ token.value ] !== 'object' ) {
			throw new Error(
				`Invalid interpolation, component node must be a ReactElement or null: \`${ token.value }\``
			);
		}
		// we should never see a componentClose token in this loop
		if ( token.type === 'componentClose' ) {
			throw new Error( `Missing opening component token: \`${ token.value }\`` );
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
		const closeIndex = getCloseIndex( openIndex, tokens );
		const grandChildTokens = tokens.slice( openIndex + 1, closeIndex );
		const grandChildren = buildChildren( grandChildTokens, components );
		const clonedOpenComponent = cloneElement( openComponent, {}, grandChildren );
		children.push( clonedOpenComponent );

		if ( closeIndex < tokens.length - 1 ) {
			const siblingTokens = tokens.slice( closeIndex + 1 );
			const siblings = buildChildren( siblingTokens, components );
			children = children.concat( siblings );
		}
	}

	children = children.filter( Boolean );

	if ( children.length === 0 ) {
		return null;
	}

	if ( children.length === 1 ) {
		return children[ 0 ];
	}

	return createElement( Fragment, null, ...children );
}

export default function interpolate( options ) {
	const { mixedString, components, throwErrors } = options;

	if ( ! components ) {
		return mixedString;
	}

	if ( typeof components !== 'object' ) {
		if ( throwErrors ) {
			throw new Error(
				`Interpolation Error: unable to process \`${ mixedString }\` because components is not an object`
			);
		}

		return mixedString;
	}

	const tokens = tokenize( mixedString );

	try {
		return buildChildren( tokens, components );
	} catch ( error ) {
		if ( throwErrors ) {
			throw new Error(
				`Interpolation Error: unable to process \`${ mixedString }\` because of error \`${ error.message }\``
			);
		}

		return mixedString;
	}
}
