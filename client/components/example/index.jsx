
/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import ButtonGroup from 'components/button-group';
import Button from 'components/button';

export default class Example extends Component {
	static propTypes = {
		renderButtons: PropTypes.func,
	}

	static defaultProps = {
		renderButtons: noop,
	}

	constructor( props ) {
		super( props );

		this._toggleView = this._toggleView.bind( this );

		this.state = {
			sourceShown: false
		};
	}

	_getButtonText() {
		return this.state.sourceShown ? 'View Example' : 'View Source';
	}

	_renderButtons() {
		const toggleViewButton = <Button
			compact
			primary
			onClick={ this._toggleView }
		>{ this._getButtonText() }</Button>;

		return (
			<div style={ { 'float': 'right' } }>
				{ this.props.renderButtons() }
				{ toggleViewButton }
			</div>
		);
	}

	_renderContent() {
		const example = this.props.children;
		const { sourceShown } = this.state;
		const opacity = sourceShown ? 0 : 1;

		return (
			<div style={ { position: 'relative' } }>
				<div style={ { opacity } }>{ example }</div>
				{ this._renderSourceCode() }
			</div>
		);
	}

	_renderSourceCode() {
		if ( ! this.state.sourceShown ) {
			return;
		}

		const text = stringifyComponent( this.props.children );
		const highlighted = prism.highlight( text, prism.languages.jsx );

		return <pre style={ { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, padding: '1em' } }>
			<code
				style={ { fontSize: 13 } }
				dangerouslySetInnerHTML={ { __html: highlighted } } // eslint-disable-line react/no-danger
			/>
		</pre>;
	}

	render() {
		console.log('Example rendered');

		return (
			<div style={ { margin: '20px 0' } }>
				<div style={ { overflow: 'hidden', marginBottom: 20 } }>
					<h2 style={ { 'float': 'left', fontSize: '28px', lineHeight: '1em' } }>{ `\<${ this.props.title }\>`}</h2>
					{ this._renderButtons() }
				</div>
				{ this._renderContent() }
			</div>
		);
	}

	_toggleView() {
		this.setState( {
			sourceShown: ! this.state.sourceShown
		} );
	}
}

function stringifyComponent( elements, depth = 0 ) {
	let indent = '';

	for ( let i = 0; i < depth; i++ ) {
		indent += '  ';
	}

	return indent + React.Children.map( elements, element => {
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

function getElementName( { type } ) {
	type = type.WrappedComponent || type;

	if ( typeof type === 'string' ) {
		return type;
	}

	return type.displayName || type.name;
}
