
/**
 * External dependencies
 */
import React, { Component } from 'react';
import prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import classNames from 'classnames';

export default class JSXTreeRenderer extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			tree: null
		};
	}

	setTarget( element ) {
		if ( ! element ) {
			return;
		}

		const internalInstance = getInternalInstance( element );
		const tree = getRenderTree( internalInstance );

		if ( ! tree ) {
			return;
		}

		this.setState( { tree } );
	}

	renderSourceCode() {
		const { tree } = this.state;

		if ( ! tree ) {
			return;
		}

		const text = stringifyComponent( tree );
		const highlighted = prism.highlight( text, prism.languages.jsx );

		return <code
			className="jsx-tree-renderer__code"
			dangerouslySetInnerHTML={ { __html: highlighted } } />; // eslint-disable-line react/no-danger
	}

	render() {
		const { className } = this.props;
		const classes = classNames( className, 'jsx-tree-renderer' );
		const code = this.renderSourceCode();
		const display = code ? 'block' : 'none';
		return <pre
			className={ classes }
			style={ { display } }
			>{ code }</pre>;
	}
}

function stringifyComponent( elements, { depth = 0, inline = false } = {} ) {
	const newLine = inline ? '' : '\n';
	const MAX_STRING_LENGTH = 30;
	const INDENT_UNIT = '  ';
	let indent = '';

	if ( inline ) {
		indent += repeat( INDENT_UNIT, depth );
	}

	return indent + React.Children.toArray( elements )

		// ignore undefined and whitespace children
		.filter( element => !! element && element !== ' ' )

		.map( element => {
			if ( typeof element === 'string' ) {
				return truncate( element, MAX_STRING_LENGTH );
			}

			const name = getElementName( element );
			const { props } = element;
			const { children } = props;

			let result = `<${ name }${ stringifyProps( props, { indent: indent + INDENT_UNIT, inline } ) }`;

			if ( children ) {
				result += '>';
				result += newLine;
				result += stringifyComponent( children, { depth: depth + 1 } );
				result += newLine;
				result += `${ indent }</${ name }>`;
			} else {
				result += ' />';
			}

			return result;
		} )

		.join( `${ newLine }${ indent }` );
}

function stringifyProps( props, { indent, inline } ) {
	const keys = Object.keys( props ).filter( key => key !== 'children' );
	const newLine = inline ? '' : '\n';
	indent = inline ? '' : indent;
	let result = '';

	if ( ! keys.length ) {
		return result;
	}

	if ( keys.length > 1 ) {
		result += `${ newLine }${ indent }`;
	} else {
		result += ' ';
	}

	return result + keys.map( key => {
		const value = props[ key ];
		const isString = typeof value === 'string';
		const before = isString ? '' : '{ ';
		const after = isString ? '' : ' }';
		return `${ key }=${ before }${ stringifyPropValue( props[ key ] ) }${ after }`;
	} ).join( `${ newLine }${ indent }` );
}

function stringifyPropValue( value ) {
	const MAX_STRING_LENGTH = 30;

	switch ( typeof value ) {
		case 'function': return '[function]';
		case 'string': return `"${ truncate( value, MAX_STRING_LENGTH ) }"`;
		case 'boolean':
		case 'number': return `${ value }`;
		case 'object':

			// react element
			if ( value.props ) {
				return stringifyComponent( value, { inline: true } );
			}

			// array
			if ( Array.isArray( value ) ) {
				return `[ ${ value.map( stringifyPropValue ).join( ', ' ) } ]`;
			}

			try {
				return `${ JSON.stringify( value ) }`;
			} catch ( err ) {}
		default:
			return `'${ String( value ) }'`;
	}
}

function truncate( string, maxLength ) {
	return string.length > maxLength ? `${ string.slice( 0, maxLength ) }…` : string;
}

function getElementName( element ) {
	if ( element.type ) {
		return getElementName( element.type );
	}

	if ( element.WrappedComponent ) {
		return getElementName( element.WrappedComponent );
	}

	if ( element._composedComponent ) {
		return getElementName( element._composedComponent );
	}

	if ( typeof element === 'string' ) {
		return element;
	}

	const result = element.displayName || element.name;
	return result;
}

function getInternalInstance( element ) {
	return element._reactInternalInstance;
}

function getRenderTree( internalInstance ) {
	try {
		const renderedComponent = internalInstance._renderedComponent;

		if ( isWrapped( internalInstance ) ) {
			return getRenderTree( renderedComponent );
		}

		return renderedComponent._currentElement;
	} catch ( e ) {
		return null;
	}
}

function repeat( string, times ) {
	let result = '';

	while ( times-- ) {
		result += string;
	}

	return result;
}

function isWrapped( internalInstance ) {
	try {
		return !! internalInstance._currentElement.type.WrappedComponent;
	} catch ( e ) {
		return false;
	}
}
