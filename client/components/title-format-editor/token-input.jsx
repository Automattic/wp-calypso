/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';

const stringify = data =>
	data
		.map(
			d =>
				'string' === d.type
					? d.value
					: `<a class="title-format-editor__token" data-name="${ d.type }">\u200b${ d.value }</a>`
		)
		.join( '' );

class TokenField extends Component {
	announce = () => {
		const { onChange } = this.props;

		if ( 'function' !== typeof onChange ) {
			return;
		}

		const clone = document.createElement( 'div' );
		clone.innerHTML = this.editor.innerHTML;
		clone.normalize();

		let node = clone.firstChild;
		const data = [];

		if ( ! node ) {
			return onChange( data );
		}

		do {
			switch ( node.nodeName.toLowerCase() ) {
				case '#text':
					data.push( { type: 'string', value: node.textContent } );
					break;
				case 'a':
					data.push( {
						type: node.getAttribute( 'data-name' ),
						value: node.textContent.trim(),
					} );
					break;
			}
		} while ( ( node = node.nextSibling ) );

		onChange( data );
	};

	addToken = ( name, title ) => {
		this.editor.focus();

		document.execCommand(
			'insertHTML',
			false,
			`<a class="title-format-editor__token" data-name="${ name }">\u200b${ title }\u200b</a>`
		);

		const node = window.getSelection().anchorNode.parentNode;
		node.setAttribute( 'contentEditable', false );

		this.editor.focus();
	};

	inputEvent = () => {
		let node = this.editor.firstChild;
		let text;
		do {
			if ( ! node ) {
				break;
			}
			const name = node.nodeName.toLowerCase();

			if ( name !== '#text' && name !== 'a' && name !== 'br' && name !== 'span' ) {
				if ( node.textContent.length > 0 ) {
					text = document.createTextNode( node.textContent );
					this.editor.insertBefore( text, node );
				}
				this.editor.removeChild( node );
				node = this.editor.firstChild;
			}
		} while ( ( node = node.nextSibling ) );

		text && window.getSelection().collapse( text, 0 );

		this.announce();
	};

	keyUp = () => {};

	onClick = () => {};

	reset = () => {
		window.getSelection().selectAllChildren( this.editor );
		document.execCommand( 'insertHTML', false, stringify( this.props.initialValue || '' ) );

		let node = this.editor.firstChild;
		do {
			if ( ! node ) {
				break;
			}

			if ( node.nodeName.toLowerCase() === 'a' ) {
				node.setAttribute( 'contentEditable', false );
			}
		} while ( ( node = node.nextSibline ) );
	};

	storeEditor = ref => {
		this.editor = ref;

		if ( ! ref ) {
			return;
		}

		window.getSelection().selectAllChildren( this.editor );
		document.execCommand( 'insertHTML', false, stringify( this.props.initialValue || '' ) );

		let node = this.editor.firstChild;
		do {
			if ( ! node ) {
				break;
			}

			if ( node.nodeName.toLowerCase() === 'a' ) {
				node.setAttribute( 'contentEditable', false );
			}
		} while ( ( node = node.nextSibline ) );

		ref.addEventListener( 'click', event => {
			if ( event.target.nodeName.toLowerCase() !== 'a' ) {
				return;
			}

			const selection = window.getSelection();
			const range = document.createRange();

			range.selectNode( event.target );

			selection.removeAllRanges();
			selection.addRange( range );

			document.execCommand( 'delete' );
		} );

		ref.addEventListener( 'paste', event => {
			event.preventDefault();
			event.stopPropagation();

			const text = event.clipboardData.getData( 'text' );
			document.execCommand( 'insertText', false, text );
		} );
	};

	render() {
		return (
			<div
				ref={ this.storeEditor }
				contentEditable={ ! this.props.disabled }
				onInput={ this.inputEvent }
				onBlur={ this.inputEvent }
				onKeyUp={ this.keyUp }
				onClick={ this.onClick }
			/>
		);
	}
}

export default TokenField;
