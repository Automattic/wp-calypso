/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { noop } from 'lodash';

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

	isTagOpen = tag => ! tag;

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
						onClick={ noop }
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
