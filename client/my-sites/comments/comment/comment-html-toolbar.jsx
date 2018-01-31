/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { map, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';

export class CommentHtmlToolbar extends Component {
	state = {
		openTags: [],
	};

	isTagOpen = noop;

	onClickBold = noop;

	onClickCloseTags = noop;

	onClickCode = noop;

	onClickDelete = noop;

	onClickInsert = noop;

	onClickItalic = noop;

	onClickListItem = noop;

	onClickOrderedList = noop;

	onClickQuote = noop;

	onClickUnorderedList = noop;

	openImageDialog = noop;

	openLinkDialog = noop;

	render() {
		const { translate } = this.props;

		const buttons = {
			strong: {
				label: 'b',
				onClick: this.onClickBold,
			},
			em: {
				label: 'i',
				onClick: this.onClickItalic,
			},
			a: {
				label: 'link',
				onClick: this.openLinkDialog,
			},
			blockquote: {
				label: 'b-quote',
				onClick: this.onClickQuote,
			},
			del: {
				onClick: this.onClickDelete,
			},
			ins: {
				onClick: this.onClickInsert,
			},
			img: {
				onClick: this.openImageDialog,
			},
			ul: {
				onClick: this.onClickUnorderedList,
			},
			ol: {
				onClick: this.onClickOrderedList,
			},
			li: {
				onClick: this.onClickListItem,
			},
			code: {
				onClick: this.onClickCode,
			},
			'close-tags': {
				disabled: ! this.state.openTags.length,
				label: translate( 'close tags' ),
				onClick: this.onClickCloseTags,
			},
		};

		return (
			<div className="comment__html-toolbar">
				{ map( buttons, ( { disabled, label, onClick }, tag ) => (
					<Button
						borderless
						className={ `comment__html-toolbar-button-${ tag } ${
							this.isTagOpen( tag ) ? 'is-tag-open' : ''
						}` }
						compact
						disabled={ disabled }
						key={ tag }
						onClick={ onClick }
					>
						{ label || tag }
					</Button>
				) ) }
			</div>
		);
	}
}

export default localize( CommentHtmlToolbar );
