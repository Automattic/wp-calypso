/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import {
	map,
	reduce,
	throttle,
} from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import config from 'config';
import { isWithinBreakpoint } from 'lib/viewport';
import AddImageDialog from './add-image-dialog';
import AddLinkDialog from './add-link-dialog';
import Button from 'components/button';

/**
 * Module constants
 */
const TOOLBAR_HEIGHT = 39;

export class EditorHtmlToolbar extends Component {

	static propTypes = {
		content: PropTypes.object,
		moment: PropTypes.func,
		onToolbarChangeContent: PropTypes.func,
		translate: PropTypes.func,
	};

	state = {
		isPinned: false,
		isScrollable: false,
		isScrolledFull: false,
		openTags: [],
		selectedText: '',
		showImageDialog: false,
		showLinkDialog: false,
	};

	componentDidMount() {
		this.pinToolbarOnScroll = throttle( this.pinToolbarOnScroll, 50 );
		this.hideToolbarFadeOnFullScroll = throttle( this.hideToolbarFadeOnFullScroll, 200 );

		window.addEventListener( 'scroll', this.pinToolbarOnScroll );
		window.addEventListener( 'resize', this.onWindowResize );
		this.buttons.addEventListener( 'scroll', this.hideToolbarFadeOnFullScroll );

		this.toggleToolbarScrollableOnResize();
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.pinToolbarOnScroll );
		window.removeEventListener( 'resize', this.onWindowResize );
		this.buttons.removeEventListener( 'scroll', this.hideToolbarFadeOnFullScroll );
	}

	bindButtonsRef = div => {
		this.buttons = div;
	}

	onWindowResize = () => {
		throttle( this.disablePinOnSmallScreens, 400 );
		throttle( this.toggleToolbarScrollableOnResize, 200 );
	}

	pinToolbarOnScroll = () => {
		if ( isWithinBreakpoint( '<660px' ) ) {
			return;
		}

		const { offsetTop } = this.props.content;
		const { isPinned } = this.state;

		if ( isPinned && window.pageYOffset < offsetTop - TOOLBAR_HEIGHT ) {
			this.setState( { isPinned: false } );
		} else if ( ! isPinned && window.pageYOffset > offsetTop - TOOLBAR_HEIGHT ) {
			this.setState( { isPinned: true } );
		}
	}

	disablePinOnSmallScreens = () => {
		if ( isWithinBreakpoint( '<660px' ) ) {
			this.setState( { isPinned: false } );
		}
	}

	toggleToolbarScrollableOnResize = () => {
		const isScrollable = this.buttons.scrollWidth > this.buttons.clientWidth;
		if ( isScrollable !== this.state.isScrollable ) {
			this.setState( { isScrollable } );
		}
	}

	hideToolbarFadeOnFullScroll = event => {
		const { scrollLeft, scrollWidth, clientWidth } = event.target;
		// 10 is bit of tolerance in case the scroll stops some pixels short of the toolbar width
		const isScrolledFull = scrollLeft >= scrollWidth - clientWidth - 10;

		if ( isScrolledFull !== this.state.isScrolledFull ) {
			this.setState( { isScrolledFull } );
		}
	}

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
		( options.paragraph ? '\n' : '' ) +
		( options.indent ? '\t' : '' ) +
		`<${ name }${ this.attributesToString( attributes ) }>` +
		( options.paragraph ? '\n' : '' );

	closeHtmlTag = ( { name, options = {} } ) =>
		`</${ name }>` +
		( options.newLineAfter ? '\n' : '' ) +
		( options.paragraph ? '\n\n' : '' );

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
		const content = tag.options && tag.options.paragraph
			? '\n' + selfClosedTag + '\n\n'
			: selfClosedTag;
		this.updateEditorContent( before + inner + content + after );
	}

	insertHtmlTagWithText( tag ) {
		const { before, after } = this.splitEditorContent();
		this.updateEditorContent( before + this.openHtmlTag( tag ) + tag.options.text + this.closeHtmlTag( tag ) + after );
	}

	insertCustomContent( content, options = {} ) {
		const { before, inner, after } = this.splitEditorContent();
		this.updateEditorContent(
			before + inner +
			( options.paragraph ? '\n' : '' ) +
			content +
			( options.paragraph ? '\n\n' : '' ) +
			after );
	}

	insertHtmlTag( tag ) {
		const { content: {
			selectionEnd,
			selectionStart,
		} } = this.props;
		if ( selectionEnd === selectionStart ) {
			this.isTagOpen( tag.name ) ? this.insertHtmlTagClose( tag ) : this.insertHtmlTagOpen( tag );
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
		this.insertHtmlTag( { name: 'blockquote', options: { paragraph: true } } );
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
		this.insertHtmlTag( { name: 'ul', options: { paragraph: true } } );
	}

	onClickOrderedList = () => {
		this.insertHtmlTag( { name: 'ol', options: { paragraph: true } } );
	}

	onClickListItem = () => {
		this.insertHtmlTag( { name: 'li', options: { indent: true, newLineAfter: true } } );
	}

	onClickCode = () => {
		this.insertHtmlTag( { name: 'code' } );
	}

	onClickMore = () => {
		this.insertCustomContent( '<!--more-->', { paragraph: true } );
	}

	onClickCloseTags = () => {
		const closedTags = reduce(
			this.state.openTags,
			( tags, openTag ) => this.closeHtmlTag( { name: openTag } ) + tags,
			''
		);
		this.insertCustomContent( closedTags );
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

	isTagOpen = tag => -1 !== this.state.openTags.indexOf( tag );

	render() {
		if ( ! config.isEnabled( 'post-editor/html-toolbar' ) ) {
			return null;
		}

		const { translate } = this.props;
		const classes = classNames( 'editor-html-toolbar', {
			'is-pinned': this.state.isPinned,
			'is-scrollable': this.state.isScrollable,
			'is-scrolled-full': this.state.isScrolledFull,
		} );

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
			more: {
				onClick: this.onClickMore,
			},
			'close-tags': {
				disabled: ! this.state.openTags.length,
				label: translate( 'close tags' ),
				onClick: this.onClickCloseTags,
			},
		};

		return (
			<div className={ classes }>
				<div className="editor-html-toolbar__wrapper">
					<div
						className="editor-html-toolbar__buttons"
						ref={ this.bindButtonsRef }
					>
						{ map( buttons, ( { disabled, label, onClick }, tag ) =>
							<Button
								borderless
								className={ `editor-html-toolbar__button-${ tag } ${ this.isTagOpen( tag ) ? 'is-tag-open' : '' }` }
								compact
								disabled={ disabled }
								key={ tag }
								onClick={ onClick }
							>
								{ label || tag }
							</Button>
						) }
					</div>
				</div>
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
