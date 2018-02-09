/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { delay, each, filter, map, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import AddImageDialog from 'post-editor/editor-html-toolbar/add-image-dialog';
import AddLinkDialog from 'post-editor/editor-html-toolbar/add-link-dialog';
import Button from 'components/button';

export class CommentHtmlEditor extends Component {
	static propTypes = {
		commentContent: PropTypes.string,
		disabled: PropTypes.bool,
		onChange: PropTypes.func,
	};

	state = {
		openTags: [],
		selectedText: '',
		showImageDialog: false,
		showLinkDialog: false,
	};

	storeTextareaRef = textarea => ( this.textarea = textarea );

	isTagOpen = tag => -1 !== this.state.openTags.indexOf( tag );

	setCursorPosition = ( selectionEnd, insertedContentLength ) => {
		this.textarea.selectionEnd = this.textarea.selectionStart =
			selectionEnd + insertedContentLength;
	};

	splitSelectedContent = () => {
		const { selectionEnd, selectionStart, value } = this.textarea;
		return {
			before: value.substring( 0, selectionStart ),
			inner: value.substring( selectionStart, selectionEnd ),
			after: value.substring( selectionEnd, value.length ),
		};
	};

	insertHtmlTag = (
		tag,
		attributes,
		options = {
			alsoClose: false,
			indent: false,
			newLineAfter: false,
			paragraph: false,
			selfClosed: false,
			text: null,
		}
	) => {
		const element = document.createElement( tag );
		each( attributes, ( value, key ) => element.setAttribute( key, value ) );
		element.innerHTML = '<!---->';
		const fragments = element.outerHTML.split( '<!---->' );
		const opener =
			( options.paragraph ? '\n' : '' ) +
			( options.indent ? '\t' : '' ) +
			fragments[ 0 ] +
			( options.paragraph ? '\n' : '' );
		const closer =
			fragments[ 1 ] + ( options.newLineAfter ? '\n' : '' ) + ( options.paragraph ? '\n\n' : '' );
		const inner = options.text || this.splitSelectedContent().inner;

		if ( inner.length || options.alsoClose ) {
			return this.insertContent( opener + inner + closer );
		}

		if ( ! options.selfClosed && this.isTagOpen( tag ) ) {
			this.setState( ( { openTags } ) => ( { openTags: filter( openTags, tag ) } ) );
			return this.insertContent( closer );
		}

		if ( ! options.selfClosed ) {
			this.setState( ( { openTags } ) => ( { openTags: openTags.concat( tag ) } ) );
		}
		return this.insertContent( opener );
	};

	insertContent = content => {
		this.textarea.focus();
		document.execCommand( 'insertText', false, content );
	};

	insertStrongTag = () => this.insertHtmlTag( 'strong' );

	insertEmTag = () => this.insertHtmlTag( 'em' );

	insertATag = ( attributes, text ) => {
		if ( text ) {
			return this.insertHtmlTag( 'a', attributes, { text } );
		}
		this.insertHtmlTag( 'a', attributes, { alsoClose: true } );
		// Move the cursor inside <a></a>
		this.setCursorPosition( this.textarea.selectionEnd, -4 );
	};

	insertBlockquoteTag = () => this.insertHtmlTag( 'blockquote', {}, { paragraph: true } );

	insertDelTag = () => this.insertHtmlTag( 'del', { datetime: this.props.moment().format() } );

	insertInsTag = () => this.insertHtmlTag( 'ins', { datetime: this.props.moment().format() } );

	insertImgTag = attributes => this.insertHtmlTag( 'img', attributes, { selfClosed: true } );

	insertUlTag = () => this.insertHtmlTag( 'ul', {}, { paragraph: true } );

	insertOlTag = () => this.insertHtmlTag( 'ol', {}, { paragraph: true } );

	insertLiTag = () => this.insertHtmlTag( 'li', {}, { indent: true, newLineAfter: true } );

	insertCodeTag = () => this.insertHtmlTag( 'code' );

	insertClosingTags = () => {
		const closedTags = reduce(
			this.state.openTags,
			( tags, openTag ) => `</${ openTag }>${ tags }`,
			''
		);
		this.insertContent( closedTags );
		this.setState( { openTags: [] } );
	};

	openLinkDialog = () => {
		const { inner } = this.splitSelectedContent();
		this.setState( { selectedText: inner, showLinkDialog: true } );
	};

	closeLinkDialog = () => {
		this.setState( { showLinkDialog: false } );
		delay( () => this.textarea.focus(), 300 );
	};

	openImageDialog = () => this.setState( { showImageDialog: true } );

	closeImageDialog = () => {
		this.setState( { showImageDialog: false } );
		delay( () => this.textarea.focus(), 300 );
	};
	render() {
		const { commentContent, onChange } = this.props;
		const { openTags, selectedText, showImageDialog, showLinkDialog } = this.state;

		const buttons = {
			strong: { label: 'b', onClick: this.insertStrongTag },
			em: { label: 'i', onClick: this.insertEmTag },
			a: { label: 'link', onClick: this.openLinkDialog },
			blockquote: { label: 'b-quote', onClick: this.insertBlockquoteTag },
			del: { onClick: this.insertDelTag },
			ins: { onClick: this.insertInsTag },
			img: { onClick: this.openImageDialog, selfClosed: true },
			ul: { onClick: this.insertUlTag },
			ol: { onClick: this.insertOlTag },
			li: { onClick: this.insertLiTag },
			closeTags: {
				disabled: ! openTags.length,
				label: 'close tags',
				onClick: this.insertClosingTags,
			},
		};

		return (
			<div className="comment__html-editor">
				<div className="comment__html-toolbar">
					{ map( buttons, ( { disabled, label, onClick, selfClosed }, tag ) => (
						<Button
							borderless
							className={ classNames( `comment__html-toolbar-button-${ tag }`, {
								'is-tag-open': ! selfClosed && this.isTagOpen( tag ),
							} ) }
							compact
							disabled={ disabled }
							key={ tag }
							onClick={ onClick }
						>
							{ label || tag }
						</Button>
					) ) }
				</div>

				<textarea
					className="comment__edit-textarea form-textarea"
					disabled={ this.props.disabled }
					onChange={ onChange }
					ref={ this.storeTextareaRef }
					value={ commentContent }
				/>

				<AddImageDialog
					onClose={ this.closeImageDialog }
					onInsert={ this.insertImgTag }
					shouldDisplay={ showImageDialog }
				/>

				<AddLinkDialog
					onClose={ this.closeLinkDialog }
					onInsert={ this.insertATag }
					selectedText={ selectedText }
					shouldDisplay={ showLinkDialog }
				/>
			</div>
		);
	}
}

export default localize( CommentHtmlEditor );
