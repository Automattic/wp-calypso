/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { reduce } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddImageDialog from './add-image-dialog';
import AddLinkDialog from './add-link-dialog';
import Button from 'components/button';

export class EditorHtmlToolbar extends Component {

	static propTypes = {
		content: PropTypes.object,
		moment: PropTypes.func,
		onToolbarChangeContent: PropTypes.func,
		translate: PropTypes.func,
	};

	state = {
		openTags: [],
		selectedText: '',
		showImageDialog: false,
		showLinkDialog: false,
	};

	getSelectedText() {
		const { content: {
			selectionEnd,
			selectionStart,
			value,
		} } = this.props;
		return value.substring( selectionStart, selectionEnd );
	}

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
		( attributesString, attributeValue, attributeName ) =>
			attributeValue
				? attributesString + ` ${ attributeName }="${ attributeValue }"`
				: attributesString,
		''
	);

	openHtmlTag = ( tag, attributes = {}, options = {} ) =>
		( options.newLine ? '\n' : '' ) +
		`<${ tag }${ this.attributesToString( attributes ) }>` +
		( options.newLine ? '\n\t' : '' );

	closeHtmlTag = ( tag, options = {} ) =>
		( options.newLine ? '\n' : '' ) +
		`</${ tag }>` +
		( options.newLine ? '\n\n' : '' );

	insertHtmlTag( tag, attributes = {}, options = {} ) {
		const { content: {
			selectionEnd,
			selectionStart,
			value,
		} } = this.props;
		const { openTags } = this.state;

		if ( options.text ) {
			this.updateContent(
				value.substring( 0, selectionStart ) +
				this.openHtmlTag( tag, attributes, options ) +
				options.text +
				this.closeHtmlTag( tag, options ) +
				value.substring( selectionEnd, value.length )
			);
		} else if ( selectionEnd === selectionStart ) {
			const isTagOpen = -1 !== openTags.indexOf( tag );

			if ( isTagOpen ) {
				this.updateContent(
					value.substring( 0, selectionStart ) +
					this.closeHtmlTag( tag, options ) +
					value.substring( selectionStart, value.length )
				);
				this.setState( {
					openTags: openTags.filter( openTag => openTag !== tag ),
				} );
			} else {
				this.updateContent(
					value.substring( 0, selectionStart ) +
					this.openHtmlTag( tag, attributes, options ) +
					value.substring( selectionStart, value.length )
				);
				this.setState( {
					openTags: openTags.concat( tag ),
				} );
			}
		} else {
			this.updateContent(
				value.substring( 0, selectionStart ) +
				this.openHtmlTag( tag, attributes, options ) +
				value.substring( selectionStart, selectionEnd ) +
				this.closeHtmlTag( tag, options ) +
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

	handleClickLink = ( attributes, text ) => {
		this.insertHtmlTag( 'a', attributes, { text } );
	};

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

	handleClickImage = attributes => {
		const { content: {
			selectionEnd,
			value,
		} } = this.props;
		this.updateContent(
			value.substring( 0, selectionEnd ) +
			`<img${ this.attributesToString( attributes ) } />` +
			value.substring( selectionEnd, value.length )
		);
	}

	handleClickUnorderedList = () => {
		this.insertHtmlTag( 'ul', {}, {
			newLine: true,
		} );
	}

	handleClickOrderedList = () => {
		this.insertHtmlTag( 'ol', {}, {
			newLine: true,
		} );
	}

	handleClickListItem = () => {
		this.insertHtmlTag( 'li' );
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

	handleClickCloseTags = () => {
		const { content: {
			selectionEnd,
			value,
		} } = this.props;
		const closedTags = reduce(
			this.state.openTags,
			( tags, openTag ) => this.closeHtmlTag( openTag ) + tags,
			''
		);
		this.updateContent(
			value.substring( 0, selectionEnd ) +
			closedTags +
			value.substring( selectionEnd, value.length )
		);
		this.setState( { openTags: [] } );
	}

	tagLabel( tag, label ) {
		const { openTags } = this.state;
		return -1 === openTags.indexOf( tag ) ? label : `/${ label }`;
	}

	openImageDialog = () => {
		this.setState( { showImageDialog: true } );
	}

	closeImageDialog = () => {
		this.setState( { showImageDialog: false } );
	}

	openLinkDialog = () => {
		this.setState( {
			selectedText: this.getSelectedText(),
			showLinkDialog: true,
		} );
	}

	closeLinkDialog = () => {
		this.setState( { showLinkDialog: false } );
	}

	render() {
		const { translate } = this.props;
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
					className="editor-html-toolbar__button-link"
					compact
					onClick={ this.openLinkDialog }
				>
					link
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
					className="editor-html-toolbar__button-image"
					compact
					onClick={ this.openImageDialog }
				>
					img
				</Button>
				<Button
					className="editor-html-toolbar__button-unordered-list"
					compact
					onClick={ this.handleClickUnorderedList }
				>
					{ this.tagLabel( 'ul', 'ul' ) }
				</Button>
				<Button
					className="editor-html-toolbar__button-ordered-list"
					compact
					onClick={ this.handleClickOrderedList }
				>
					{ this.tagLabel( 'ol', 'ol' ) }
				</Button>
				<Button
					className="editor-html-toolbar__button-list-item"
					compact
					onClick={ this.handleClickListItem }
				>
					{ this.tagLabel( 'li', 'li' ) }
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
				<Button
					className="editor-html-toolbar__button-close-tags"
					compact
					onClick={ this.handleClickCloseTags }
				>
					{ translate( 'Close Tags' ) }
				</Button>

				<AddImageDialog
					onClose={ this.closeImageDialog }
					onInsert={ this.handleClickImage }
					shouldDisplay={ this.state.showImageDialog }
				/>
				<AddLinkDialog
					onClose={ this.closeLinkDialog }
					onInsert={ this.handleClickLink }
					selectedText={ this.state.selectedText }
					shouldDisplay={ this.state.showLinkDialog }
				/>
			</div>
		);
	}
}

export default localize( EditorHtmlToolbar );
