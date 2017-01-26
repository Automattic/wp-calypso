/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { map, reduce } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isMobile } from 'lib/viewport';
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

	splitEditorContent() {
		const { content: {
			selectionEnd,
			selectionStart,
			value,
		} } = this.props;
		return {
			before: value.substring( 0, selectionStart ),
			inner: value.substring( selectionStart, selectionEnd ),
			after: value.substring( selectionEnd, value.length ),
		};
	}

	setCursorPosition( previousSelectionEnd, insertedContentLength ) {
		this.props.content.selectionEnd = this.props.content.selectionStart =
			previousSelectionEnd + insertedContentLength;
	}

	updateEditorContent( newContent ) {
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

	openHtmlTag = ( { name, attributes = {}, options = {} } ) =>
		( options.newLine ? '\n' : '' ) +
		`<${ name }${ this.attributesToString( attributes ) }>` +
		( options.newLine ? '\n\t' : '' );

	closeHtmlTag = ( { name, options = {} } ) =>
		( options.newLine ? '\n' : '' ) +
		`</${ name }>` +
		( options.newLine ? '\n\n' : '' );

	insertHtmlTagOpen( tag ) {
		const { openTags } = this.state;
		const { before, after } = this.splitEditorContent();
		this.updateEditorContent( before + this.openHtmlTag( tag ) + after );
		this.setState( { openTags: openTags.concat( tag.name ) } );
	}

	insertHtmlTagClose( tag ) {
		const { openTags } = this.state;
		const { before, after } = this.splitEditorContent();
		this.updateEditorContent( before + this.closeHtmlTag( tag ) + after );
		this.setState( { openTags: openTags.filter( openTag => openTag !== tag.name ) } );
	}

	insertHtmlTagOpenClose( tag ) {
		const { before, inner, after } = this.splitEditorContent();
		this.updateEditorContent( before + this.openHtmlTag( tag ) + inner + this.closeHtmlTag( tag ) + after );
	}

	insertHtmlTagSelfClosed( tag ) {
		const { before, inner, after } = this.splitEditorContent();
		const selfClosedTag = `<${ tag.name }${ this.attributesToString( tag.attributes ) } />`;
		const content = tag.options && tag.options.newLine ? '\n' + selfClosedTag + '\n\n' : selfClosedTag;
		this.updateEditorContent( before + inner + content + after );
	}

	insertHtmlTagWithText( tag ) {
		const { before, after } = this.splitEditorContent();
		this.updateEditorContent( before + this.openHtmlTag( tag ) + tag.options.text + this.closeHtmlTag( tag ) + after );
	}

	insertCustomContent( content ) {
		const { before, inner, after } = this.splitEditorContent();
		this.updateEditorContent( before + inner + content + after );
	}

	insertHtmlTag( tag ) {
		const { content: {
			selectionEnd,
			selectionStart,
		} } = this.props;
		const { openTags } = this.state;
		if ( selectionEnd === selectionStart ) {
			const isTagOpen = -1 !== openTags.indexOf( tag.name );
			isTagOpen ? this.insertHtmlTagClose( tag ) : this.insertHtmlTagOpen( tag );
		} else {
			this.insertHtmlTagOpenClose( tag );
		}
	}

	onClickBold = () => {
		this.insertHtmlTag( { name: 'strong' } );
	}

	onClickItalic = () => {
		this.insertHtmlTag( { name: 'em' } );
	}

	onClickLink = ( attributes, text ) => {
		if ( text ) {
			this.insertHtmlTagWithText( { name: 'a', attributes, options: { text } } );
		} else {
			this.insertHtmlTagOpenClose( { name: 'a', attributes } );
			// Move the cursor inside <a></a>
			this.setCursorPosition( this.props.content.selectionEnd, -4 );
		}
	};

	onClickQuote = () => {
		this.insertHtmlTag( { name: 'blockquote' } );
	}

	onClickDelete = () => {
		const datetime = this.props.moment().format();
		this.insertHtmlTag( { name: 'del', attributes: { datetime } } );
	}

	onClickInsert = () => {
		const datetime = this.props.moment().format();
		this.insertHtmlTag( { name: 'ins', attributes: { datetime } } );
	}

	onClickImage = attributes => {
		this.insertHtmlTagSelfClosed( { name: 'img', attributes } );
	}

	onClickUnorderedList = () => {
		this.insertHtmlTag( { name: 'ul', options: { newLine: true } } );
	}

	onClickOrderedList = () => {
		this.insertHtmlTag( { name: 'ol', options: { newLine: true } } );
	}

	onClickListItem = () => {
		this.insertHtmlTag( { name: 'li' } );
	}

	onClickCode = () => {
		this.insertHtmlTag( { name: 'code' } );
	}

	onClickMore = () => {
		this.insertCustomContent( '<!--more-->' );
	}

	onClickCloseTags = () => {
		const { content: {
			selectionEnd,
			value,
		} } = this.props;
		const closedTags = reduce(
			this.state.openTags,
			( tags, openTag ) => this.closeHtmlTag( { name: openTag } ) + tags,
			''
		);
		this.updateEditorContent(
			value.substring( 0, selectionEnd ) +
			closedTags +
			value.substring( selectionEnd, value.length )
		);
		this.setState( { openTags: [] } );
	}

	openImageDialog = () => {
		this.setState( { showImageDialog: true } );
	}

	closeImageDialog = () => {
		this.setState( { showImageDialog: false } );
	}

	openLinkDialog = () => {
		const { inner: selectedText } = this.splitEditorContent();
		this.setState( {
			selectedText,
			showLinkDialog: true,
		} );
	}

	closeLinkDialog = () => {
		this.setState( { showLinkDialog: false } );
	}

	tagLabel( tag, label ) {
		const { openTags } = this.state;
		return -1 === openTags.indexOf( tag ) ? label : `/${ label }`;
	}

	render() {
		const { translate } = this.props;
		const buttons = {
			bold: {
				label: this.tagLabel( 'strong', 'b' ),
				onClick: this.onClickBold,
			},
			italic: {
				label: this.tagLabel( 'em', 'i' ),
				onClick: this.onClickItalic,
			},
			link: {
				label: 'link',
				onClick: this.openLinkDialog,
			},
			quote: {
				label: this.tagLabel( 'blockquote', 'b-quote' ),
				onClick: this.onClickQuote,
			},
			del: {
				label: this.tagLabel( 'del', 'del' ),
				onClick: this.onClickDelete,
			},
			ins: {
				label: this.tagLabel( 'ins', 'ins' ),
				onClick: this.onClickInsert,
			},
			image: {
				label: 'img',
				onClick: this.openImageDialog,
			},
			unorderedList: {
				label: this.tagLabel( 'ul', 'ul' ),
				onClick: this.onClickUnorderedList,
			},
			orderedList: {
				label: this.tagLabel( 'ol', 'ol' ),
				onClick: this.onClickOrderedList,
			},
			listItem: {
				label: this.tagLabel( 'li', 'li' ),
				onClick: this.onClickListItem,
			},
			code: {
				label: this.tagLabel( 'code', 'code' ),
				onClick: this.onClickCode,
			},
			more: {
				label: 'more',
				onClick: this.onClickMore,
			},
			closeTags: {
				label: translate( 'Close Tags' ),
				onClick: this.onClickCloseTags,
			},
		};

		return (
			<div className="editor-html-toolbar">
				{ map( buttons, ( { label, onClick }, tag ) =>
					<Button
						className={ `editor-html-toolbar__button-${ tag }` }
						compact={ ! isMobile() }
						key={ tag }
						onClick={ onClick }
					>
						{ label }
					</Button>
				) }
				<AddImageDialog
					onClose={ this.closeImageDialog }
					onInsert={ this.onClickImage }
					shouldDisplay={ this.state.showImageDialog }
				/>
				<AddLinkDialog
					onClose={ this.closeLinkDialog }
					onInsert={ this.onClickLink }
					selectedText={ this.state.selectedText }
					shouldDisplay={ this.state.showLinkDialog }
				/>
			</div>
		);
	}
}

export default localize( EditorHtmlToolbar );
