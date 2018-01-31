/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { map, noop, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { closeHtmlTag, insertCustomContent, insertHtmlTag } from 'lib/html-toolbar';

export class CommentHtmlEditor extends Component {
	static propTypes = {
		commentContent: PropTypes.string,
		disabled: PropTypes.bool,
		onChange: PropTypes.func,
	};

	state = {
		openTags: [],
	};

	componentWillMount() {
		const { commentContent } = this.props;
		this.setState( { commentContent } );
	}

	storeTextareaRef = textarea => ( this.textarea = textarea );

	isTagOpen = tag => -1 !== this.state.openTags.indexOf( tag.name );

	insertHtmlTag = tag => {
		const isTagOpen = insertHtmlTag( this.textarea, tag, this.isTagOpen( tag ) );
		this.setState( ( { openTags } ) => ( {
			openTags: isTagOpen
				? openTags.concat( tag.name )
				: openTags.filter( openTag => openTag !== tag.name ),
		} ) );
	};

	onClickBold = () => this.insertHtmlTag( { name: 'strong' } );

	onClickCloseTags = () => {
		const closedTags = reduce(
			this.state.openTags,
			( tags, openTag ) => closeHtmlTag( { name: openTag } ) + tags,
			''
		);
		insertCustomContent( this.textarea, closedTags );
		this.setState( { openTags: [] } );
	};

	onClickCode = () => this.insertHtmlTag( { name: 'code' } );

	onClickDelete = () =>
		this.insertHtmlTag( {
			name: 'del',
			attributes: { datetime: this.props.moment().format() },
		} );

	onClickInsert = () =>
		this.insertHtmlTag( {
			name: 'ins',
			attributes: { datetime: this.props.moment().format() },
		} );

	onClickItalic = () => this.insertHtmlTag( { name: 'em' } );

	onClickListItem = () =>
		this.insertHtmlTag( {
			name: 'li',
			options: { indent: true, newLineAfter: true },
		} );

	onClickOrderedList = () => this.insertHtmlTag( { name: 'ol', options: { paragraph: true } } );

	onClickQuote = () => this.insertHtmlTag( { name: 'blockquote', options: { paragraph: true } } );

	onClickUnorderedList = () => this.insertHtmlTag( { name: 'ul', options: { paragraph: true } } );

	openImageDialog = noop;

	openLinkDialog = noop;

	setCommentContentValue = event => this.setState( { commentContent: event.target.value } );

	render() {
		const { commentContent, onChange, translate } = this.props;

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
			<div>
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

				<textarea
					className="comment__edit-textarea form-textarea"
					disabled={ this.props.disabled }
					onChange={ onChange }
					ref={ this.storeTextareaRef }
					value={ commentContent }
				/>
			</div>
		);
	}
}

export default localize( CommentHtmlEditor );
