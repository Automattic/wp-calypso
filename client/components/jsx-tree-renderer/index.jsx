
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

	_renderSourceCode() {
		const { tree } = this.state;

		if ( ! tree ) {
			return;
		}

		const text = stringifyComponent( tree );
		const highlighted = prism.highlight( text, prism.languages.jsx );

		return <pre style={ { padding: '0.6em 0.8em', margin: 0 } }>
			<code
				style={ { fontSize: 13 } }
				dangerouslySetInnerHTML={ { __html: highlighted } } // eslint-disable-line react/no-danger
			/>
		</pre>;
	}

	render() {
		const { className } = this.props;
		const classes = classNames( className, 'jsx-tree-renderer' );
		const code = this._renderSourceCode();
		const display = code ? 'block' : 'none';
		return <div className={ classes } style={ { display } }>{ code }</div>;
	}
}

function stringifyComponent( elements, depth = 0 ) {
	let indent = '';

	for ( let i = 0; i < depth; i++ ) {
		indent += '  ';
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

			let result = `<${ name }${ stringifyProps( props ) }`;

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

function stringifyProps( props ) {
	const keys = Object.keys( props )
		.filter( key => key !== 'children' );

	if ( ! keys.length ) {
		return '';
	}

	return ' ' + keys.map( key => {
		return `${ key }=${ stringifyPropValue( props[ key ] ) }`;
	} ).join( ' ' );
}

function stringifyPropValue( value ) {
	switch ( typeof value ) {
		case 'function': return '{ [function] }';
		case 'string': return `"${ value }"`;
		default: return `{ ${ String( value ) } }`;
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
