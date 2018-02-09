/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { each } from 'lodash';

/**
 * Internal dependencies
 */
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

	insertHtml = ( tag, attributes ) => {
		const element = document.createElement( tag );
		const isOpen = this.isTagOpen( tag );
		const { inner } = this.splitSelectedContent();

		if ( ! isOpen ) {
			each( attributes, ( value, key ) => element.setAttribute( key, value ) );
		}

		if ( inner.length ) {
			element.innerHTML = inner;
			return this.insertContent( element.outerHTML );
		}

		element.innerHTML = '<!---->';
		const [ opener, closer ] = element.outerHTML.split( '<!---->' );

		if ( isOpen ) {
			return this.insertContent( closer );
		}
		return this.insertContent( opener );
	};

	insertContent = content => {
		this.textarea.focus();
		document.execCommand( 'insertText', false, content );
	};

	insertStrongTag = () => this.insertHtml( 'strong' );

	render() {
		const { commentContent, disabled, onChange } = this.props;

		return (
			<div className="comment__html-editor">
				<div className="comment__html-toolbar">
					<Button
						borderless
						className={ classNames( 'comment__html-toolbar-button-strong', {
							'is-tag-open': this.isTagOpen( 'strong' ),
						} ) }
						compact
						disabled={ disabled }
						key="strong"
						onClick={ this.insertStrongTag }
					>
						b
					</Button>
				</div>

				<textarea
					className="comment__edit-textarea form-textarea"
					disabled={ disabled }
					onChange={ onChange }
					ref={ this.storeTextareaRef }
					value={ commentContent }
				/>
			</div>
		);
	}
}

export default localize( CommentHtmlEditor );
