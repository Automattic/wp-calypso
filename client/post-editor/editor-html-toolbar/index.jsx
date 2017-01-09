/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { reduce } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

export class EditorHtmlToolbar extends Component {

	static propTypes = {
		content: PropTypes.object,
		moment: PropTypes.func,
		onToolbarChangeContent: PropTypes.func,
	};

	state = {
		openTags: [],
	};

	setCursorPosition( previousSelectionEnd, insertedContentLength ) {
		this.props.content.selectionEnd = this.props.content.selectionStart =
			previousSelectionEnd + insertedContentLength;
	}

	updateContent( newContent ) {
		const { content: { selectionEnd, value }, onToolbarChangeContent } = this.props;
		this.props.content.value = newContent;
		onToolbarChangeContent( newContent );
		this.setCursorPosition( selectionEnd, newContent.length - value.length );
		this.props.content.focus();
	}

	attributesToString = ( attributes = {} ) => reduce(
		attributes,
		( attributesString, attributeValue, attributeName ) => ` ${ attributeName }="${ attributeValue }"`,
		''
	);

	insertHtmlTag( tag, attributes = {} ) {
		const { content: {
			selectionEnd,
			selectionStart,
			value,
		} } = this.props;
		const { openTags } = this.state;
		const attributesString = this.attributesToString( attributes );

		if ( selectionEnd === selectionStart ) {
			const isTagOpen = -1 !== openTags.indexOf( tag );

			this.updateContent(
				value.substring( 0, selectionStart ) +
				`<${ isTagOpen ? '/' : '' }${ tag }${ isTagOpen ? '' : attributesString }>` +
				value.substring( selectionStart, value.length )
			);

			if ( isTagOpen ) {
				this.setState( {
					openTags: openTags.filter( openTag => openTag !== tag ),
				} );
			} else {
				this.setState( {
					openTags: openTags.concat( tag ),
				} );
			}
		} else {
			this.updateContent(
				value.substring( 0, selectionStart ) +
				`<${ tag }${ attributesString }>` +
				value.substring( selectionStart, selectionEnd ) +
				`</${ tag }>` +
				value.substring( selectionEnd, value.length )
			);
		}
	}

	handleClickBold = () => {
		this.insertHtmlTag( 'strong' );
	}

	handleClickItalic = () => {
		this.insertHtmlTag( 'em' );
	}

	handleClickQuote = () => {
		this.insertHtmlTag( 'blockquote' );
	}

	handleClickDelete = () => {
		this.insertHtmlTag( 'del', {
			datetime: this.props.moment().format(),
		} );
	}

	handleClickInsert = () => {
		this.insertHtmlTag( 'ins', {
			datetime: this.props.moment().format(),
		} );
	}

	handleClickCode = () => {
		this.insertHtmlTag( 'code' );
	}

	handleClickMore = () => {
		const { content: {
			selectionEnd,
			value,
		} } = this.props;
		this.updateContent(
			value.substring( 0, selectionEnd ) +
			'<!--more-->' +
			value.substring( selectionEnd, value.length )
		);
	}

	tagLabel( tag, label ) {
		const { openTags } = this.state;
		return -1 === openTags.indexOf( tag ) ? label : `/${ label }`;
	}

	render() {
		return (
			<div className="editor-html-toolbar">
				<Button
					className="editor-html-toolbar__button-bold"
					compact
					onClick={ this.handleClickBold }
				>
					{ this.tagLabel( 'strong', 'b' ) }
				</Button>
				<Button
					className="editor-html-toolbar__button-italic"
					compact
					onClick={ this.handleClickItalic }
				>
					{ this.tagLabel( 'em', 'i' ) }
				</Button>
				<Button
					className="editor-html-toolbar__button-quote"
					compact
					onClick={ this.handleClickQuote }
				>
					{ this.tagLabel( 'blockquote', 'b-quote' ) }
				</Button>
				<Button
					className="editor-html-toolbar__button-delete"
					compact
					onClick={ this.handleClickDelete }
				>
					{ this.tagLabel( 'del', 'del' ) }
				</Button>
				<Button
					className="editor-html-toolbar__button-insert"
					compact
					onClick={ this.handleClickInsert }
				>
					{ this.tagLabel( 'ins', 'ins' ) }
				</Button>
				<Button
					className="editor-html-toolbar__button-code"
					compact
					onClick={ this.handleClickCode }
				>
					{ this.tagLabel( 'code', 'code' ) }
				</Button>
				<Button
					className="editor-html-toolbar__button-more"
					compact
					onClick={ this.handleClickMore }
				>
					more
				</Button>
			</div>
		);
	}
}

export default localize( EditorHtmlToolbar );
