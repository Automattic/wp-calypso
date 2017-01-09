/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

export default class EditorHtmlToolbar extends Component {

	static propTypes = {
		content: PropTypes.object,
		onToolbarChangeContent: React.PropTypes.func,
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

	insertHtmlTag( tag ) {
		const { content: {
			selectionEnd,
			selectionStart,
			value,
		} } = this.props;
		const { openTags } = this.state;

		if ( selectionEnd === selectionStart ) {
			const isTagOpen = -1 !== openTags.indexOf( tag );

			this.updateContent(
				value.substring( 0, selectionStart ) +
				`<${ isTagOpen ? '/' : '' }${ tag }>` +
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
				`<${ tag }>` +
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
			</div>
		);
	}
}
