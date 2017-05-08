
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

function stringifyComponent( elements, depth = 0 ) {
	const TWO_SPACES = '  ';
	let indent = '';

	for ( let i = 0; i < depth; i++ ) {
		indent += TWO_SPACES;
	}

	return indent + React.Children.toArray( elements )
		.filter( element => !! element )
		.map( element => {
			if ( typeof element === 'string' ) {
				return truncate( element, 30 );
			}

			const name = getElementName( element );
			const { props } = element;
			const { children } = props;

			let result = `<${ name }${ stringifyProps( props, indent + TWO_SPACES ) }`;

			if ( children ) {
				result += '>\n';
				result += stringifyComponent( children, depth + 1 );
				result += `\n${ indent }</${ name }>`;
			} else {
				result += ' />';
			}

			return result;
		} ).join( `\n${ indent }` );
}

function stringifyProps( props, indent ) {
	const keys = Object.keys( props ).filter( key => key !== 'children' );
	let result = '';

	if ( ! keys.length ) {
		return result;
	}

	if ( keys.length > 1 ) {
		result += `\n${ indent }`;
	} else {
		result += ' ';
	}

	return result + keys.map( key => {
		return `${ key }=${ stringifyPropValue( props[ key ] ) }`;
	} ).join( `\n${ indent }` );
}

function stringifyPropValue( value ) {
	switch ( typeof value ) {
		case 'function': return '{ [function] }';
		case 'string': return `"${ value }"`;
		case 'boolean':
		case 'number': return `{ ${ value } }`;
		case 'object':
			try {
				return `{ ${ JSON.stringify( value ) } }`;
			} catch ( err ) {}
		default:
			return `{ '${ String( value ) }' }`;
	}
}

function truncate( string, length ) {
	if ( string.length < length ) {
		return string;
	}

	return `${ string.slice( 0, length ) }…`;
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

function isWrapped( internalInstance ) {
	try {
		return !! internalInstance._currentElement.type.WrappedComponent;
	} catch ( e ) {
		return false;
	}
}
