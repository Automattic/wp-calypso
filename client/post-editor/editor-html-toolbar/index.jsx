/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {
	get,
	map,
	reduce,
	throttle,
} from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { Env } from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
import { serialize } from 'components/tinymce/plugins/contact-form/shortcode-utils';
import MediaActions from 'lib/media/actions';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import MediaUtils from 'lib/media/utils';
import MediaValidationStore from 'lib/media/validation-store';
import PostActions from 'lib/posts/actions';
import { isWithinBreakpoint } from 'lib/viewport';
import markup from 'post-editor/media-modal/markup';
import { getSelectedSite } from 'state/ui/selectors';
import {
	fieldAdd,
	fieldRemove,
	fieldUpdate,
	settingsUpdate
} from 'state/ui/editor/contact-form/actions';
import AddImageDialog from './add-image-dialog';
import AddLinkDialog from './add-link-dialog';
import Button from 'components/button';
import ContactFormDialog from 'components/tinymce/plugins/contact-form/dialog';
import EditorMediaModal from 'post-editor/editor-media-modal';
import MediaLibraryDropZone from 'my-sites/media-library/drop-zone';

/**
 * Module constant
 */
const TOOLBAR_HEIGHT = 39;

export class EditorHtmlToolbar extends Component {

	static propTypes = {
		contactForm: PropTypes.object,
		content: PropTypes.object,
		fieldAdd: PropTypes.func,
		fieldRemove: PropTypes.func,
		fieldUpdate: PropTypes.func,
		moment: PropTypes.func,
		onToolbarChangeContent: PropTypes.func,
		settingsUpdate: PropTypes.func,
		translate: PropTypes.func,
	};

	state = {
		contactFormDialogTab: 'fields',
		isPinned: false,
		isScrollable: false,
		isScrolledFull: false,
		openTags: [],
		selectedText: '',
		showContactFormDialog: false,
		showImageDialog: false,
		showInsertContentMenu: false,
		showLinkDialog: false,
		showMediaModal: false,
	};

	componentDidMount() {
		this.pinToolbarOnScroll = throttle( this.pinToolbarOnScroll, 50 );
		this.hideToolbarFadeOnFullScroll = throttle( this.hideToolbarFadeOnFullScroll, 200 );
		this.onWindowResize = throttle( this.onWindowResize, 400 );

		window.addEventListener( 'scroll', this.pinToolbarOnScroll );
		window.addEventListener( 'resize', this.onWindowResize );
		this.buttons.addEventListener( 'scroll', this.hideToolbarFadeOnFullScroll );
		document.addEventListener( 'click', this.clickOutsideInsertContentMenu );

		this.toggleToolbarScrollableOnResize();
	}

	componentWillUnmount() {
		this.pinToolbarOnScroll.cancel();
		this.onWindowResize.cancel();
		this.hideToolbarFadeOnFullScroll.cancel();
		window.removeEventListener( 'scroll', this.pinToolbarOnScroll );
		window.removeEventListener( 'resize', this.onWindowResize );
		this.buttons.removeEventListener( 'scroll', this.hideToolbarFadeOnFullScroll );
		document.removeEventListener( 'click', this.clickOutsideInsertContentMenu );
	}

	bindButtonsRef = div => {
		this.buttons = div;
	}

	bindInsertContentButtonsRef = div => {
		this.insertContentButtons = div;
	}

	onWindowResize = () => {
		this.disablePinOnSmallScreens();
		this.toggleToolbarScrollableOnResize();
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
		if ( this.state.isPinned && isWithinBreakpoint( '<660px' ) ) {
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

	clickOutsideInsertContentMenu = event => {
		if ( this.state.showInsertContentMenu && ! this.insertContentButtons.contains( event.target ) ) {
			this.setState( { showInsertContentMenu: false } );
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

	updateEditorContent = ( before, newContent, after ) => {
		// Browser is Firefox
		if ( Env.gecko ) {
			// In Firefox, execCommand( 'insertText' ), needed to preserve the undo stack,
			// always moves the cursor to the end of the content.
			// A workaround involving manually setting the cursor position and inserting the editor content
			// is needed to put the cursor back to the correct position.
			return this.updateEditorContentFirefox( before, newContent, after );
		}

		// Browser is Internet Explorer 11
		if ( 11 === Env.ie ) {
			// execCommand( 'insertText' ), needed to preserve the undo stack, does not exist in IE11.
			// Using the previous version of replacing the entire content value instead.
			return this.updateEditorContentIE11( before, newContent, after );
		}

		return this.insertEditorContent( before, newContent, after );
	}

	insertEditorContent( before, newContent, after ) {
		const { content, onToolbarChangeContent } = this.props;
		content.focus();
		document.execCommand( 'insertText', false, newContent );
		onToolbarChangeContent( before + newContent + after );
	}

	updateEditorContentFirefox( before, newContent, after ) {
		const fullContent = before + newContent + after;
		const { content, content: { selectionEnd, value }, onToolbarChangeContent } = this.props;
		this.props.content.value = fullContent;
		content.focus();
		document.execCommand( 'insertText', false, newContent );
		onToolbarChangeContent( fullContent );
		this.setCursorPosition( selectionEnd, fullContent.length - value.length );
		this.props.content.focus();
	}

	updateEditorContentIE11( before, newContent, after ) {
		const fullContent = before + newContent + after;
		const { content: { selectionEnd, value }, onToolbarChangeContent } = this.props;
		this.props.content.value = fullContent;
		onToolbarChangeContent( fullContent );
		this.setCursorPosition( selectionEnd, fullContent.length - value.length );
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
		this.updateEditorContent( before, this.openHtmlTag( tag ), after );
		this.setState( { openTags: openTags.concat( tag.name ) } );
	}

	insertHtmlTagClose( tag ) {
		const { openTags } = this.state;
		const { before, after } = this.splitEditorContent();
		this.updateEditorContent( before, this.closeHtmlTag( tag ), after );
		this.setState( { openTags: openTags.filter( openTag => openTag !== tag.name ) } );
	}

	insertHtmlTagOpenClose( tag ) {
		const { before, inner, after } = this.splitEditorContent();
		this.updateEditorContent( before, this.openHtmlTag( tag ) + inner + this.closeHtmlTag( tag ), after );
	}

	insertHtmlTagSelfClosed( tag ) {
		const { before, inner, after } = this.splitEditorContent();
		const selfClosedTag = `<${ tag.name }${ this.attributesToString( tag.attributes ) } />`;
		const content = tag.options && tag.options.paragraph
			? '\n' + selfClosedTag + '\n\n'
			: selfClosedTag;
		this.updateEditorContent( before, inner + content, after );
	}

	insertHtmlTagWithText( tag ) {
		const { before, after } = this.splitEditorContent();
		this.updateEditorContent( before, this.openHtmlTag( tag ) + tag.options.text + this.closeHtmlTag( tag ), after );
	}

	insertCustomContent( content, options = {} ) {
		const { before, inner, after } = this.splitEditorContent();
		const paragraph = options.paragraph ? '\n' : '';
		this.updateEditorContent(
			before,
			inner + paragraph + content + paragraph + paragraph,
			after
		);
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

	onInsertMedia = media => {
		this.insertCustomContent( media );
	}

	onInsertContactForm = () => {
		this.insertCustomContent( serialize( this.props.contactForm ), { paragraph: true } );
		this.closeContactFormDialog();
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

	toggleInsertContentMenu = () => {
		this.setState( { showInsertContentMenu: ! this.state.showInsertContentMenu } );
	}

	openContactFormDialog = () => {
		this.setState( {
			contactFormDialogTab: 'fields',
			showContactFormDialog: true,
			showInsertContentMenu: false,
		} );
	}

	toggleContactFormDialogTab = () => {
		this.setState( {
			contactFormDialogTab: 'fields' === this.state.contactFormDialogTab
				? 'settings'
				: 'fields',
		} );
	}

	closeContactFormDialog = () => {
		this.setState( { showContactFormDialog: false } );
	}

	openMediaModal = () => {
		this.setState( {
			showInsertContentMenu: false,
			showMediaModal: true,
		} );
	}

	closeMediaModal = () => {
		this.setState( { showMediaModal: false } );
	}

	onFilesDrop = () => {
		const { site } = this.props;
		// Find selected images. Non-images will still be uploaded, but not
		// inserted directly into the post contents.
		const selectedItems = MediaLibrarySelectedStore.getAll( site.ID );
		const isSingleImage = 1 === selectedItems.length && 'image' === MediaUtils.getMimePrefix( selectedItems[ 0 ] );

		if ( isSingleImage && ! MediaValidationStore.hasErrors( site.ID ) ) {
			// For single image upload, insert into post content, blocking save
			// until the image has finished upload
			if ( selectedItems[ 0 ].transient ) {
				PostActions.blockSave( 'MEDIA_MODAL_TRANSIENT_INSERT' );
			}

			this.onInsertMedia( markup.get( site, selectedItems[ 0 ] ) );
			MediaActions.setLibrarySelectedItems( site.ID, [] );
		} else {
			// In all other cases, show the media modal list view
			this.openMediaModal();
		}
	}

	isTagOpen = tag => -1 !== this.state.openTags.indexOf( tag );

	render() {
		const {
			site,
			translate,
		} = this.props;

		const classes = classNames( 'editor-html-toolbar', {
			'is-pinned': this.state.isPinned,
			'is-scrollable': this.state.isScrollable,
			'is-scrolled-full': this.state.isScrolledFull,
		} );
		const insertContentClasses = classNames( 'editor-html-toolbar__insert-content-dropdown',
			{ 'is-visible': this.state.showInsertContentMenu }
		);

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
					<div className="editor-html-toolbar__wrapper-buttons">
						<div
							className="editor-html-toolbar__buttons"
							ref={ this.bindButtonsRef }
						>
							<div className="editor-html-toolbar__button-insert-content" ref={ this.bindInsertContentButtonsRef }>
								<Button
									borderless
									className="editor-html-toolbar__button-insert-media"
									compact
									onClick={ this.openMediaModal }
								>
									<Gridicon icon="add-outline" />
								</Button>
								<Button
									borderless
									className="editor-html-toolbar__button-insert-content-dropdown"
									compact
									onClick={ this.toggleInsertContentMenu }
								>
									<Gridicon icon={ this.state.showInsertContentMenu ? 'chevron-up' : 'chevron-down' } />
								</Button>
							</div>
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

						<div className={ insertContentClasses }>
							<div
								className="editor-html-toolbar__insert-content-dropdown-item"
								onClick={ this.openMediaModal }
							>
								<Gridicon icon="add-image" />
								<span>{ translate( 'Add Media' ) }</span>
							</div>
							<div
								className="editor-html-toolbar__insert-content-dropdown-item"
								onClick={ this.openContactFormDialog }
							>
								<Gridicon icon="mention" />
								<span>{ translate( 'Add Contact Form' ) }</span>
							</div>
						</div>
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

				<ContactFormDialog
					activeTab={ this.state.contactFormDialogTab }
					isEdit={ false }
					onChangeTabs={ this.toggleContactFormDialogTab }
					onClose={ this.closeContactFormDialog }
					onFieldAdd={ this.props.fieldAdd }
					onFieldRemove={ this.props.fieldRemove }
					onFieldUpdate={ this.props.fieldUpdate }
					onInsert={ this.onInsertContactForm }
					onSettingsUpdate={ this.props.settingsUpdate }
					showDialog={ this.state.showContactFormDialog }
				/>

				<EditorMediaModal
					onClose={ this.closeMediaModal }
					onInsertMedia={ this.onInsertMedia }
					visible={ this.state.showMediaModal }
				/>

				<MediaLibraryDropZone
					onAddMedia={ this.onFilesDrop }
					site={ site }
				/>
			</div>
		);
	}
}

const mapStateToProps = state => ( {
	contactForm: get( state, 'ui.editor.contactForm', {} ),
	site: getSelectedSite( state ),
} );

const mapDispatchToProps = {
	fieldAdd,
	fieldRemove,
	fieldUpdate,
	settingsUpdate,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( EditorHtmlToolbar ) );
