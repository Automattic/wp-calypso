/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { delay, each, get, map, reduce, reject } from 'lodash';

/**
 * Internal dependencies
 */
import AddImageDialog from 'my-sites/comments/comment/comment-html-editor/add-image-dialog';
import AddLinkDialog from 'my-sites/comments/comment/comment-html-editor/add-link-dialog';
import { Button } from '@automattic/components';
import { withLocalizedMoment } from 'components/localized-moment';

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

	storeTextareaRef = ( textarea ) => ( this.textarea = textarea );

	isTagOpen = ( tag ) => -1 !== this.state.openTags.indexOf( tag );

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
			adjustCursorPosition: 0,
			alsoClose: false,
			indent: false,
			newLineAfter: false,
			paragraph: false,
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
			return this.insertContent(
				fragments[ 1 ] ? opener + inner + closer : inner + opener,
				options.adjustCursorPosition
			);
		}

		if ( !! fragments[ 1 ] && this.isTagOpen( tag ) ) {
			this.setState( ( { openTags } ) => ( {
				openTags: reject( openTags, ( openTag ) => openTag === tag ),
			} ) );
			return this.insertContent( closer, options.adjustCursorPosition );
		}

		if ( !! fragments[ 1 ] ) {
			this.setState( ( { openTags } ) => ( { openTags: openTags.concat( tag ) } ) );
		}
		return this.insertContent( opener, options.adjustCursorPosition );
	};

	insertContent = ( content, adjustCursorPosition = 0 ) => {
		const userAgent = get( window, 'navigator.userAgent', '' );

		// In Firefox, IE, and Edge, `document.execCommand( 'insertText' )` doesn't work.
		// @see https://bugzilla.mozilla.org/show_bug.cgi?id=1220696
		if (
			/(?:firefox|fxios)/i.test( userAgent ) ||
			/(?:edge|msie |trident.+?; rv:)/i.test( userAgent )
		) {
			const { selectionEnd, value } = this.textarea;
			const { before, after } = this.splitSelectedContent();
			const newContent = before + content + after;
			const event = { target: { value: newContent } };
			this.props.onChange( event, () => {
				this.setCursorPosition(
					selectionEnd,
					newContent.length - value.length + adjustCursorPosition
				);
				this.textarea.focus();
			} );
			return;
		}

		this.textarea.focus();
		document.execCommand( 'insertText', false, content );

		if ( adjustCursorPosition ) {
			this.setCursorPosition( this.textarea.selectionEnd, adjustCursorPosition );
		}
	};

	insertStrongTag = () => this.insertHtmlTag( 'strong' );

	insertEmTag = () => this.insertHtmlTag( 'em' );

	insertATag = ( attributes, text ) => {
		if ( text ) {
			return this.insertHtmlTag( 'a', attributes, { text } );
		}
		// Also move the cursor inside <a></a>
		this.insertHtmlTag( 'a', attributes, { adjustCursorPosition: -4, alsoClose: true } );
	};

	insertBlockquoteTag = () => this.insertHtmlTag( 'blockquote', {}, { paragraph: true } );

	insertDelTag = () => this.insertHtmlTag( 'del', { datetime: this.props.moment().format() } );

	insertInsTag = () => this.insertHtmlTag( 'ins', { datetime: this.props.moment().format() } );

	insertImgTag = ( attributes ) => this.insertHtmlTag( 'img', attributes );

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
			img: { onClick: this.openImageDialog },
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
			<div className="comment-html-editor">
				<div className="comment-html-editor__toolbar">
					{ map( buttons, ( { disabled, label, onClick }, tag ) => (
						<Button
							borderless
							className={ classNames( `comment-html-editor__toolbar-button-${ tag }`, {
								'is-tag-open': this.isTagOpen( tag ),
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
					className="comment-html-editor__textarea form-textarea"
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

export default localize( withLocalizedMoment( CommentHtmlEditor ) );
