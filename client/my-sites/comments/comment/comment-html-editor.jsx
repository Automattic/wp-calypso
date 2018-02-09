/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { delay, each, map } from 'lodash';

/**
 * Internal dependencies
 */
import AddLinkDialog from 'post-editor/editor-html-toolbar/add-link-dialog';
import Button from 'components/button';

export class CommentHtmlEditor extends Component {
	static propTypes = {
		commentContent: PropTypes.string,
		disabled: PropTypes.bool,
		onChange: PropTypes.func,
	};

	state = {
		selectedText: '',
		showImageDialog: false,
		showLinkDialog: false,
	};

	storeTextareaRef = textarea => ( this.textarea = textarea );

	isTagOpen = tag => {
		const { commentContent } = this.props;
		const openers = commentContent.match( new RegExp( `<${ tag }.*?>`, 'gi' ) ) || [];
		const closers = commentContent.match( new RegExp( `<\/${ tag }>`, 'gi' ) ) || [];
		return openers.length > closers.length;
	};

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

	insertHtml = ( tag, attributes, options = { alsoClose: false, text: null } ) => {
		const element = document.createElement( tag );
		const isTagOpen = this.isTagOpen( tag );
		const inner = options.text || this.splitSelectedContent().inner;

		if ( ! isTagOpen ) {
			each( attributes, ( value, key ) => element.setAttribute( key, value ) );
		}

		if ( inner.length ) {
			element.innerHTML = inner;
			return this.insertContent( element.outerHTML );
		}

		element.innerHTML = '<!---->';
		const [ opener, closer ] = element.outerHTML.split( '<!---->' );

		if ( options.alsoClose ) {
			return this.insertContent( opener + closer );
		}
		if ( isTagOpen ) {
			return this.insertContent( closer );
		}
		return this.insertContent( opener );
	};

	insertContent = content => {
		this.textarea.focus();
		document.execCommand( 'insertText', false, content );
	};

	insertStrongTag = () => this.insertHtml( 'strong', { foo: 'bar' } );

	insertLinkTag = ( attributes, text ) => {
		if ( text ) {
			return this.insertHtml( 'a', attributes, { text } );
		}
		this.insertHtml( 'a', attributes, { alsoClose: true } );
		// Move the cursor inside <a></a>
		this.setCursorPosition( this.textarea.selectionEnd, -4 );
	};

	openLinkDialog = () => {
		const { inner } = this.splitSelectedContent();
		this.setState( { selectedText: inner, showLinkDialog: true } );
	};

	closeLinkDialog = () => {
		this.setState( { showLinkDialog: false } );
		delay( () => this.textarea.focus(), 500 );
	};

	render() {
		const { commentContent, onChange } = this.props;
		const { selectedText, showLinkDialog } = this.state;

		const buttons = {
			strong: { label: 'b', onClick: this.insertStrongTag },
			a: { label: 'link', onClick: this.openLinkDialog },
		};

		return (
			<div className="comment__html-editor">
				<div className="comment__html-toolbar">
					{ map( buttons, ( { disabled, label, onClick }, tag ) => (
						<Button
							borderless
							className={ classNames( `comment__html-toolbar-button-${ tag }`, {
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
					className="comment__edit-textarea form-textarea"
					disabled={ this.props.disabled }
					onChange={ onChange }
					ref={ this.storeTextareaRef }
					value={ commentContent }
				/>

				<AddLinkDialog
					onClose={ this.closeLinkDialog }
					onInsert={ this.insertLinkTag }
					selectedText={ selectedText }
					shouldDisplay={ showLinkDialog }
				/>
			</div>
		);
	}
}

export default localize( CommentHtmlEditor );
