/**
 * External dependencies
 */
import { isWithinBreakpoint } from '@automattic/viewport';
import React from 'react';
import ReactDom from 'react-dom';
import page from 'page';
import PropTypes from 'prop-types';
import { debounce, flow, get, partial, throttle } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import tinyMce from 'tinymce/tinymce';
import { v4 as uuid } from 'uuid';

/**
 * Internal dependencies
 */
import { autosave, editPost, saveEdited } from 'state/posts/actions';
import { addSiteFragment } from 'lib/route';
import EditorActionBar from 'post-editor/editor-action-bar';
import FeaturedImage from 'post-editor/editor-featured-image';
import EditorTitle from 'post-editor/editor-title';
import EditorPageSlug from 'post-editor/editor-page-slug';
import TinyMCE from 'components/tinymce';
import SegmentedControl from 'components/segmented-control';
import InvalidURLDialog from 'post-editor/invalid-url-dialog';
import RestorePostDialog from 'post-editor/restore-post-dialog';
import VerifyEmailDialog from 'components/email-verification/email-verification-dialog';
import * as utils from 'state/posts/utils';
import EditorPreview from './editor-preview';
import { recordEditorStat, recordEditorEvent } from 'state/posts/stats';
import { bumpStat } from 'lib/analytics/mc';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import {
	saveConfirmationSidebarPreference,
	editorEditRawContent,
	editorResetRawContent,
	setEditorIframeLoaded,
} from 'state/ui/editor/actions';
import { closeEditorSidebar, openEditorSidebar } from 'state/ui/editor/sidebar/actions';
import {
	getEditorPostId,
	isConfirmationSidebarEnabled,
	isEditorNewPost,
	isEditorAutosaving,
	isEditorLoading,
	isEditorSaveBlocked,
	getEditorPostPreviewUrl,
	getEditorLoadingError,
} from 'state/ui/editor/selectors';
import { recordTracksEvent, recordGoogleEvent } from 'state/analytics/actions';
import {
	getSitePost,
	getEditedPost,
	getEditedPostValue,
	isEditedPostDirty,
} from 'state/posts/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import editedPostHasContent from 'state/selectors/edited-post-has-content';
import hasBrokenSiteUserConnection from 'state/selectors/has-broken-site-user-connection';
import isVipSite from 'state/selectors/is-vip-site';
import EditorConfirmationSidebar from 'post-editor/editor-confirmation-sidebar';
import EditorDocumentHead from 'post-editor/editor-document-head';
import EditorPostTypeUnsupported from 'post-editor/editor-post-type-unsupported';
import EditorForbidden from 'post-editor/editor-forbidden';
import EditorNotice from 'post-editor/editor-notice';
import EditorGutenbergOptInNotice from 'post-editor/editor-gutenberg-opt-in-notice';
import EditorGutenbergDialogs from 'post-editor/editor-gutenberg-dialogs';
import EditorWordCount from 'post-editor/editor-word-count';
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';
import QueryPreferences from 'components/data/query-preferences';
import { setLayoutFocus, setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { protectForm } from 'lib/protect-form';
import EditorSidebar from 'post-editor/editor-sidebar';
import Site from 'blocks/site';
import EditorStatusLabel from 'post-editor/editor-status-label';
import EditorGroundControl from 'post-editor/editor-ground-control';
import { isSitePreviewable } from 'state/sites/selectors';
import { removep } from 'lib/formatting';
import QuickSaveButtons from 'post-editor/editor-ground-control/quick-save-buttons';
import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { pauseGuidedTour } from 'state/ui/guided-tours/actions';

/**
 * Style dependencies
 */
import './style.scss';

/*
 * Throttle and debounce and callback. Used for autosave.
 * - run the callback at most every `throttleMs` milliseconds (don't autosave too often)
 * - wait for at least `debounceMs` before first call (don't autosave while still typing)
 */
function throttleAndDebounce( fn, throttleMs, debounceMs ) {
	const throttled = throttle( fn, throttleMs );
	const debounced = debounce( throttled, debounceMs );

	const throttledAndDebounced = function() {
		return debounced.apply( this, arguments );
	};

	throttledAndDebounced.cancel = () => {
		throttled.cancel();
		debounced.cancel();
	};

	return throttledAndDebounced;
}

export class PostEditor extends React.Component {
	static propTypes = {
		siteId: PropTypes.number,
		preferences: PropTypes.object,
		setEditorModePreference: PropTypes.func,
		setLayoutFocus: PropTypes.func.isRequired,
		setNextLayoutFocus: PropTypes.func.isRequired,
		editorModePreference: PropTypes.string,
		editorSidebarPreference: PropTypes.string,
		setEditorIframeLoaded: PropTypes.func,
		markChanged: PropTypes.func.isRequired,
		markSaved: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		hasBrokenPublicizeConnection: PropTypes.bool,
		editPost: PropTypes.func,
		type: PropTypes.string,
		analyticsPath: PropTypes.string,
		analyticsTitle: PropTypes.string,
	};

	state = this.getDefaultState();

	_previewWindow = null;

	getDefaultState() {
		return {
			mode: this.props.editorModePreference || 'tinymce',
			confirmationSidebar: 'closed',
			confirmationSidebarPreference: true,
			isSaving: false,
			isPublishing: false,
			notice: null,
			selectedText: null,
			showVerifyEmailDialog: false,
			showAutosaveDialog: true,
			isTitleFocused: false,
			showPreview: false,
			isPostPublishPreview: false,
		};
	}

	UNSAFE_componentWillMount() {
		this.debouncedSaveRawContent = debounce( this.saveRawContent, 200 );
		this.debouncedAutosave = throttleAndDebounce( this.doAutosave, 20000, 3000 );
		this.switchEditorVisualMode = this.switchEditorMode.bind( this, 'tinymce' );
		this.switchEditorHtmlMode = this.switchEditorMode.bind( this, 'html' );
		this.debouncedCopySelectedText = debounce( this.copySelectedText, 200 );
		this.useDefaultSidebarFocus();
		bumpStat( 'calypso_default_sidebar_mode', this.props.editorSidebarPreference );

		this.setState( {
			isEditorInitialized: false,
		} );
	}

	componentDidUpdate() {
		if ( this.props.isDirty ) {
			this.props.markChanged();
		} else {
			this.props.markSaved();
		}
	}

	componentDidMount() {
		// if post and content is already available on mount, e.g., "Press This" or a post copy
		if ( this.props.post && this.props.post.content ) {
			this.editor.setEditorContent( this.props.post.content, { initial: true } );
		}

		// record the initial value of the editor mode preference
		if ( this.props.editorModePreference ) {
			bumpStat( 'calypso_default_editor_mode', this.props.editorModePreference );
		}
	}

	componentWillUnmount() {
		this.debouncedAutosave.cancel();
		this.debouncedSaveRawContent.cancel();
		this.debouncedCopySelectedText.cancel();
		this._previewWindow = null;
		this.props.setEditorIframeLoaded( false );
		clearTimeout( this._switchEditorTimeout );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { siteId, postId } = this.props;

		if ( nextProps.siteId !== siteId || nextProps.postId !== postId ) {
			this.useDefaultSidebarFocus( nextProps );
		}

		this.onEditedPostChange( nextProps );
	}

	storeEditor = ref => {
		this.editor = ref;
	};

	useDefaultSidebarFocus( nextProps ) {
		const props = nextProps || this.props;
		if (
			isWithinBreakpoint( '>660px' ) &&
			( props.editorSidebarPreference === 'open' || props.hasBrokenPublicizeConnection )
		) {
			this.props.setLayoutFocus( 'sidebar' );
		}
	}

	hideNotice = () => {
		this.setState( { notice: null } );
	};

	setConfirmationSidebar = ( { status, context = null } ) => {
		const allowedStatuses = [ 'closed', 'open', 'publishing' ];
		const confirmationSidebar = allowedStatuses.indexOf( status ) > -1 ? status : 'closed';
		const editorSidebarPreference =
			this.props.editorSidebarPreference === 'open' ? 'sidebar' : 'content';
		this.setState( { confirmationSidebar } );

		switch ( confirmationSidebar ) {
			case 'closed':
				this.props.setLayoutFocus( editorSidebarPreference );
				this.props.recordTracksEvent( 'calypso_editor_confirmation_sidebar_close', { context } );
				break;
			case 'open':
				this.props.setLayoutFocus( 'editor-confirmation-sidebar' );
				this.props.recordTracksEvent( 'calypso_editor_confirmation_sidebar_open' );
				break;
		}
	};

	copySelectedText = () => {
		const selectedText = tinyMce.activeEditor.selection.getContent() || null;
		if ( this.state.selectedText !== selectedText ) {
			this.setState( { selectedText: selectedText || null } );
		}
	};

	handleConfirmationSidebarPreferenceChange = event => {
		this.setState( { confirmationSidebarPreference: event.target.checked } );
	};

	toggleSidebar = () => {
		this.props.layoutFocus === 'sidebar'
			? this.props.closeEditorSidebar()
			: this.props.openEditorSidebar();
	};

	loadRevision = revision => {
		this.restoreRevision( {
			content: revision.post_content,
			excerpt: revision.post_excerpt,
			title: revision.post_title,
		} );
		if ( isWithinBreakpoint( '<660px' ) ) {
			this.props.setLayoutFocus( 'content' );
		}
	};

	render() {
		const site = this.props.selectedSite;
		const mode = this.state.mode;
		const isInvalidURL = this.props.loadingError;

		const isTrashed = get( this.props.post, 'status' ) === 'trash';
		const hasAutosave = get( this.props.post, 'meta.data.autosave' );

		const classes = classNames( 'post-editor', {
			'is-loading': ! this.state.isEditorInitialized,
		} );

		return (
			<div className={ classes }>
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsTitle } />
				<QueryPreferences />
				<EditorGutenbergOptInNotice />
				<EditorConfirmationSidebar
					handlePreferenceChange={ this.handleConfirmationSidebarPreferenceChange }
					onPrivatePublish={ this.onPublish }
					onPublish={ this.onPublish }
					setPostDate={ this.setPostDate }
					setStatus={ this.setConfirmationSidebar }
					status={ this.state.confirmationSidebar }
				/>
				<EditorDocumentHead />
				<EditorPostTypeUnsupported />
				<EditorForbidden />
				<EditorRevisionsDialog loadRevision={ this.loadRevision } />
				<EditorGutenbergDialogs />
				<div className="post-editor__inner">
					<EditorGroundControl
						setPostDate={ this.setPostDate }
						hasContent={ this.props.hasContent }
						isConfirmationSidebarEnabled={ this.props.isConfirmationSidebarEnabled }
						confirmationSidebarStatus={ this.state.confirmationSidebar }
						isDirty={ this.props.isDirty }
						isSaveBlocked={ this.isSaveBlocked() }
						isPublishing={ this.state.isPublishing }
						isSaving={ this.state.isSaving }
						onPreview={ this.onPreview }
						onPublish={ this.onPublish }
						onSave={ this.onSave }
						onSaveDraft={ this.props.onSaveDraft }
						site={ site }
						toggleSidebar={ this.toggleSidebar }
						onMoreInfoAboutEmailVerify={ this.onMoreInfoAboutEmailVerify }
						allPostsUrl={ this.getAllPostsUrl() }
						isSidebarOpened={ this.props.layoutFocus === 'sidebar' }
					/>
					<div className="post-editor__content">
						<div className="post-editor__content-editor">
							<EditorActionBar />
							<div className="post-editor__site">
								<Site
									compact
									site={ site }
									indicator={ false }
									homeLink={ true }
									externalLink={ true }
								/>
								{ this.props.isDirty ? (
									<QuickSaveButtons
										isSaving={ this.state.isSaving }
										isSaveBlocked={ this.isSaveBlocked() }
										isDirty={ this.props.isDirty }
										hasContent={ this.props.hasContent }
										onSave={ this.onSave }
									/>
								) : (
									<EditorStatusLabel />
								) }
							</div>
							<div className="post-editor__inner-content">
								<FeaturedImage maxWidth={ 1462 } hasDropZone />
								<div className="post-editor__header">
									<EditorTitle onChange={ this.onEditorTitleChange } />
									<EditorPageSlug />
									<SegmentedControl className="post-editor__switch-mode" compact={ true }>
										<SegmentedControl.Item
											selected={ mode === 'tinymce' }
											onClick={ this.switchEditorVisualMode }
											title={ this.props.translate( 'Edit with a visual editor' ) }
										>
											{ this.props.translate( 'Visual', { context: 'Editor writing mode' } ) }
										</SegmentedControl.Item>
										<SegmentedControl.Item
											selected={ mode === 'html' }
											onClick={ this.switchEditorHtmlMode }
											title={ this.props.translate( 'Edit the raw HTML code' ) }
										>
											HTML
										</SegmentedControl.Item>
									</SegmentedControl>
								</div>
								<hr className="post-editor__header-divider" />
								<TinyMCE
									ref={ this.storeEditor }
									mode={ mode }
									isNew={ this.props.isNew }
									isVipSite={ this.props.isVipSite }
									onSetContent={ this.debouncedSaveRawContent }
									onInit={ this.onEditorInitialized }
									onChange={ this.onEditorContentChange }
									onKeyUp={ this.onEditorKeyUp }
									onFocus={ this.onEditorFocus }
									onMouseUp={ this.copySelectedText }
									onBlur={ this.copySelectedText }
									onTextEditorChange={ this.onEditorTextContentChange }
								/>
								<EditorWordCount selectedText={ this.state.selectedText } />
							</div>
						</div>
					</div>
					<EditorSidebar
						onPublish={ this.onPublish }
						onTrashingPost={ this.onTrashingPost }
						site={ site }
						setPostDate={ this.setPostDate }
						onSave={ this.onSave }
						confirmationSidebarStatus={ this.state.confirmationSidebar }
					/>
					{ this.props.isSitePreviewable ? (
						<EditorPreview
							showPreview={ this.state.showPreview }
							onClose={ this.onPreviewClose }
							onEdit={ this.onPreviewEdit }
							isSaving={ this.state.isSaving || this.props.isAutosaving }
							isLoading={ this.props.isLoading }
							isFullScreen={ this.state.isPostPublishPreview }
							previewUrl={ this.props.previewUrl }
							postId={ this.props.postId }
							externalUrl={ this.getExternalUrl() }
							revision={ get( this.props.post, 'revisions.length', 0 ) }
						/>
					) : null }
					<EditorNotice { ...this.state.notice } onDismissClick={ this.hideNotice } />
				</div>
				{ isTrashed ? (
					<RestorePostDialog onClose={ this.onClose } onRestore={ this.restoreTrashed } />
				) : null }
				{ this.state.showVerifyEmailDialog ? (
					<VerifyEmailDialog onClose={ this.closeVerifyEmailDialog } />
				) : null }
				{ isInvalidURL && <InvalidURLDialog onClose={ this.onClose } /> }
				{ hasAutosave && this.state.showAutosaveDialog ? (
					<RestorePostDialog
						onRestore={ this.restoreAutosave }
						onClose={ this.closeAutosaveDialog }
						isAutosave={ true }
					/>
				) : null }
			</div>
		);
	}

	restoreTrashed = () => {
		this.onSave( 'draft' );
	};

	restoreAutosave = () => {
		this.setState( { showAutosaveDialog: false } );
		this.restoreRevision( get( this.props.post, 'meta.data.autosave' ) );
	};

	restoreRevision = revision => {
		this.props.editPost( this.props.siteId, this.props.postId, {
			excerpt: revision.excerpt,
			title: revision.title,
			content: revision.content,
		} );
		if ( this.editor ) {
			this.editor.setEditorContent( revision.content, { initial: true } );
		}
	};

	closeAutosaveDialog = () => {
		this.setState( { showAutosaveDialog: false } );
	};

	closeVerifyEmailDialog = () => {
		this.setState( { showVerifyEmailDialog: false } );
	};

	onEditedPostChange = nextProps => {
		if ( nextProps.loadingError ) {
			return;
		}

		if ( ( nextProps.isNew && ! this.props.isNew ) || nextProps.isLoading ) {
			// is new or loading
			this.setState(
				this.getDefaultState(),
				() => this.editor && this.editor.setEditorContent( '' )
			);
		} else if ( this.editor && this.props.isLoading && ! nextProps.isLoading ) {
			this.editor.setEditorContent( nextProps.post.content, { initial: true } );
		}
	};

	isSaveBlocked = () => {
		return this.props.isSaveBlocked || ! this.state.isEditorInitialized;
	};

	onEditorInitialized = () => {
		this.setState( { isEditorInitialized: true } );
		// Notify external listeners that the iframe has loaded
		this.props.setEditorIframeLoaded();
	};

	onEditorTitleChange = () => {
		if ( 'open' === this.state.confirmationSidebar ) {
			this.setConfirmationSidebar( { status: 'closed', context: 'content_edit' } );
		}

		this.debouncedAutosave();
	};

	onEditorContentChange = () => {
		this.debouncedSaveRawContent();
		this.debouncedAutosave();
	};

	onEditorTextContentChange = () => {
		if ( 'open' === this.state.confirmationSidebar ) {
			this.setConfirmationSidebar( { status: 'closed', context: 'content_edit' } );
		}

		this.debouncedSaveRawContent();
		this.debouncedAutosave();
	};

	onEditorKeyUp = () => {
		if ( 'open' === this.state.confirmationSidebar ) {
			this.setConfirmationSidebar( { status: 'closed', context: 'content_edit' } );
		}

		this.debouncedCopySelectedText();
		this.debouncedSaveRawContent();
	};

	onEditorFocus = () => {
		// Fire a click when the editor is focused so that any global handlers have an opportunity to do their thing.
		// In particular, this ensures that open popovers are closed when a user clicks into the editor.
		ReactDom.findDOMNode( this.editor ).click();
	};

	saveRawContent = () => {
		this.props.editorEditRawContent( this.editor.getContent( { format: 'raw' } ) );

		// If debounced save raw content was pending, consider it flushed
		this.debouncedSaveRawContent.cancel();
	};

	// Sync content from the TinyMCE editor to the Redux state. Because it's expensive to serialize
	// the content when TinyMCE is the active mode, we don't sync on every keystroke, but only
	// immediately before save/publish and after switching editor mode.
	syncEditorContent( options ) {
		const resetRawContent = get( options, 'resetRawContent', false );
		const content = get( options, 'content', this.editor.getContent() );

		if ( resetRawContent ) {
			this.props.editorResetRawContent();
		}
		this.saveRawContent();
		if ( content !== get( this.props.post, 'content', null ) ) {
			this.props.editPost( this.props.siteId, this.props.postId, { content } );
		}
	}

	async doAutosave() {
		if ( this.state.isSaving === true || this.isSaveBlocked() ) {
			return;
		}

		this.syncEditorContent();

		// The post is either already published or the current modifications are going to publish it
		const savingPublishedPost =
			utils.isPublished( this.props.savedPost ) || utils.isPublished( this.props.post );

		if ( ! savingPublishedPost ) {
			this.setState( { isSaving: true } );
		}

		try {
			const saveResult = await this.props.autosave();
			if ( ! savingPublishedPost ) {
				this.onSaveDraftSuccess( saveResult );
			}
		} catch ( error ) {
			if ( ! savingPublishedPost ) {
				this.onSaveDraftFailure( error );
			}
		}
	}

	autosave() {
		// If debounced autosave was pending, consider it done
		this.debouncedAutosave.cancel();
		return this.doAutosave();
	}

	onClose = () => {
		// go back if we can, if not, hit all posts
		page.back( this.getAllPostsUrl() );
	};

	getAllPostsUrl = context => {
		const { type, selectedSite } = this.props;
		const site = selectedSite;

		let path;
		switch ( type ) {
			case 'page':
				path = '/pages';
				break;
			case 'post':
				path = '/posts';
				break;
			default:
				path = `/types/${ type }`;
		}

		if ( type === 'post' && site && ! site.jetpack && ! site.single_user_site ) {
			path += '/my';
		}

		if ( context === 'trashed' ) {
			path += '/trashed';
		}

		if ( site ) {
			path = addSiteFragment( path, site.slug );
		}

		return path;
	};

	onMoreInfoAboutEmailVerify = () => {
		this.setState( {
			showVerifyEmailDialog: true,
		} );
	};

	onTrashingPost = () => {
		const { type } = this.props;

		this.props.recordEditorStat( type + '_trashed' );
		this.props.recordEditorEvent(
			'page' === type ? 'Clicked Trash Page Button' : 'Clicked Trash Post Button'
		);
		this.props.markSaved();

		page( this.getAllPostsUrl( 'trashed' ) );
	};

	onSave = status => {
		// Refuse to save if the current edits would mean that an unpublished post gets published.
		// That's an exclusive resposibility of the `onPublish` method.
		if (
			! utils.isPublished( this.props.savedPost ) &&
			utils.isPublished( this.props.post, status )
		) {
			return;
		}

		// Cancel pending autosave when user initiates a save.
		// The changes will be reflected in the save payload.
		this.debouncedAutosave.cancel();

		this.setState( { isSaving: true } );

		if ( status ) {
			this.props.editPost( this.props.siteId, this.props.postId, { status } );
		}

		// Flush any pending raw content saves
		this.syncEditorContent();

		this.props.saveEdited().then( this.onSaveDraftSuccess, this.onSaveDraftFailure );
	};

	getExternalUrl() {
		const { post } = this.props;

		if ( post ) {
			return post.URL;
		}

		return this.props.previewUrl;
	}

	recordPreviewButtonClick() {
		const isPage = this.props.type === 'page';
		this.props.recordTracksEvent(
			isPage
				? 'calypso_editor_page_preview_button_click'
				: 'calypso_editor_post_preview_button_click'
		);
		this.props.recordGoogleEvent(
			'Editor',
			isPage ? 'Clicked Preview Page Button' : 'Clicked Preview Post Button',
			isPage ? 'Editor Preview Page Button Clicked' : 'Editor Preview Post Button Clicked',
			isPage ? 'editorPageButtonClicked' : 'editorPostButtonClicked'
		);
	}

	onPreview = async event => {
		this.recordPreviewButtonClick();

		if ( this.props.isSitePreviewable && ! event.metaKey && ! event.ctrlKey ) {
			return this.iframePreview();
		}

		if ( ! this._previewWindow || this._previewWindow.closed ) {
			this._previewWindow = window.open( 'about:blank', 'WordPress.com Post Preview' );
		}

		if ( this.props.isDirty ) {
			await this.autosave();
		}

		const { previewUrl } = this.props;
		if ( this._previewWindow ) {
			this._previewWindow.location = previewUrl;
			this._previewWindow.focus();
		} else {
			this._previewWindow = window.open( previewUrl, 'WordPress.com Post Preview' );
		}
	};

	iframePreview = async () => {
		if ( this.props.isDirty ) {
			await this.autosave();
		}

		this.setState( { showPreview: true } );
	};

	onPreviewClose = () => {
		if ( this.state.isPostPublishPreview ) {
			page.back( this.getAllPostsUrl() );
		} else {
			this.setState( {
				showPreview: false,
				isPostPublishPreview: false,
			} );
		}
	};

	onPreviewEdit = () => {
		if ( this.props.editorSidebarPreference === 'open' ) {
			// When returning to the editor from the preview, set the "next
			// layout focus" to the sidebar if the editor sidebar should be
			// visible.  Otherwise, according to its default behavior, the
			// LAYOUT_NEXT_FOCUS_ACTIVATE action will cause the 'content'
			// layout area to be activated, which hides the editor sidebar.
			this.props.setNextLayoutFocus( 'sidebar' );
		}

		this.hideNotice();

		this.setState( {
			showPreview: false,
			isPostPublishPreview: false,
		} );

		return false;
	};

	onSaveDraftFailure = error => {
		this.onSaveFailure( error, 'saveFailure' );
	};

	onSaveDraftSuccess = saveResult => {
		this.onSaveSuccess( saveResult, 'save' );
	};

	// determine if publish is private, future or normal
	getPublishStatus() {
		if ( utils.isPrivate( this.props.post ) ) {
			return 'private';
		}

		if ( utils.isFutureDated( this.props.post ) ) {
			return 'future';
		}

		return 'publish';
	}

	onPublish = ( isConfirmed = false ) => {
		if ( this.props.isConfirmationSidebarEnabled ) {
			if ( isConfirmed === false ) {
				this.setConfirmationSidebar( { status: 'open' } );
				return;
			}

			if ( this.state.confirmationSidebar === 'open' ) {
				this.setConfirmationSidebar( { status: 'publishing' } );
			}
		}

		// Cancel pending autosave when user initiates a save.
		// The changes will be reflected in the save payload.
		this.debouncedAutosave.cancel();

		this.setState( {
			isSaving: true,
			isPublishing: true,
		} );

		const status = this.getPublishStatus();
		this.props.editPost( this.props.siteId, this.props.postId, { status } );
		this.syncEditorContent();

		this.props.saveEdited().then( this.onPublishSuccess, this.onPublishFailure );
	};

	onPublishFailure = error => {
		if ( this.props.isConfirmationSidebarEnabled ) {
			this.setConfirmationSidebar( { status: 'closed', context: 'publish_failure' } );
		}

		this.onSaveFailure( error, 'publishFailure' );
	};

	onPublishSuccess = saveResult => {
		if ( ! this.state.confirmationSidebarPreference ) {
			this.props.saveConfirmationSidebarPreference( this.props.siteId, false );
		}

		if ( this.props.isConfirmationSidebarEnabled ) {
			this.setConfirmationSidebar( { status: 'closed', context: 'publish_success' } );
		}

		this.onSaveSuccess( saveResult, 'publish' );
	};

	onSaveFailure = ( error, message ) => {
		this.setState( {
			isSaving: false,
			isPublishing: false,
			notice: {
				status: 'is-error',
				error,
				message,
			},
		} );
	};

	setPostDate = date => {
		const { siteId, postId } = this.props;
		const dateValue = date ? date.format() : false;

		this.props.editPost( siteId, postId, { date: dateValue } );

		this.props.recordTracksEvent( 'calypso_editor_publish_date_change', {
			context: 'open' === this.state.confirmationSidebar ? 'confirmation-sidebar' : 'post-settings',
		} );
	};

	onSaveSuccess = ( saveResult, type ) => {
		let message = null;

		if ( saveResult ) {
			const { receivedPost } = saveResult;

			if ( type === 'save' ) {
				if ( utils.isPublished( receivedPost ) ) {
					message = 'updated';
				}
			} else if ( type === 'publish' ) {
				if ( utils.isPrivate( receivedPost ) ) {
					message = 'publishedPrivately';
				} else if ( utils.isFutureDated( receivedPost ) ) {
					message = 'scheduled';
				} else {
					message = 'published';
				}
			}
		}

		const nextState = {
			isSaving: false,
			isPublishing: false,
		};

		if ( message ) {
			nextState.notice = {
				status: 'is-success',
				message,
			};

			window.scrollTo( 0, 0 );

			if ( this.props.isSitePreviewable && message === 'published' ) {
				this.setState( { isPostPublishPreview: true } );
				this.iframePreview();
			}
		} else {
			nextState.notice = null;
		}

		this.setState( nextState );

		// make sure the history entry has the post ID in it, but don't dispatch
		if ( saveResult && saveResult.idAssigned ) {
			const editUrl = utils.getEditURL( saveResult.receivedPost, this.props.selectedSite );
			page.replace( editUrl, null, false, false );
		}

		// The saveEdited() action will return a result of `null` if the post is unchanged
		// so we hide any guided tours
		if ( ! saveResult ) {
			this.props.pauseGuidedTour();
		}
	};

	getContainingTagInfo = ( content, cursorPosition ) => {
		const lastLtPos = content.lastIndexOf( '<', cursorPosition );
		const lastGtPos = content.lastIndexOf( '>', cursorPosition );

		if ( lastLtPos > lastGtPos ) {
			// inside a tag that was opened, but not closed

			// find what the tag is
			const tagContent = content.substr( lastLtPos );
			const tagMatch = tagContent.match( /<\s*(\/)?(\w+)/ );
			if ( ! tagMatch ) {
				return null;
			}

			const tagType = tagMatch[ 2 ];
			const closingGt = tagContent.indexOf( '>' );
			const isClosingTag = !! tagMatch[ 1 ];

			return {
				ltPos: lastLtPos,
				gtPos: lastLtPos + closingGt + 1, // offset by one to get the position _after_ the character,
				tagType,
				isClosingTag,
			};
		}
		return null;
	};

	getCursorMarkerSpan = type => {
		const tagType = type ? type : 'start';

		return `<span
				data-mce-type="bookmark"
				id="mce_SELREST_${ tagType }"
				data-mce-style="overflow:hidden;line-height:0"
				style="overflow:hidden;line-height:0"
			>&#65279;</span>`;
	};

	addHTMLBookmarkInTextAreaContent = () => {
		const textArea = this.editor._editor.getElement();

		let htmlModeCursorStartPosition = textArea.selectionStart;
		let htmlModeCursorEndPosition = textArea.selectionEnd;

		// check if the cursor is in a tag and if so, adjust it
		const isCursorStartInTag = this.getContainingTagInfo(
			textArea.value,
			htmlModeCursorStartPosition
		);
		if ( isCursorStartInTag ) {
			htmlModeCursorStartPosition = isCursorStartInTag.ltPos;
		}

		const isCursorEndInTag = this.getContainingTagInfo( textArea.value, htmlModeCursorEndPosition );
		if ( isCursorEndInTag ) {
			htmlModeCursorEndPosition = isCursorEndInTag.gtPos;
		}

		const mode = htmlModeCursorStartPosition !== htmlModeCursorEndPosition ? 'range' : 'single';

		let selectedText = null;

		if ( mode === 'range' ) {
			const bookMarkEnd = this.getCursorMarkerSpan( 'end' );

			selectedText = [
				textArea.value.slice( htmlModeCursorStartPosition, htmlModeCursorEndPosition ),
				bookMarkEnd,
			].join( '' );
		}

		textArea.value = [
			textArea.value.slice( 0, htmlModeCursorStartPosition ), // text until the cursor/selection position
			this.getCursorMarkerSpan( 'start' ), // cursor/selection start marker
			selectedText, // selected text with end cursor/position marker
			textArea.value.slice( htmlModeCursorEndPosition ), // text from last cursor/selection position to end
		].join( '' );

		this.editor.onTextAreaChange( { target: { value: textArea.value } } );
	};

	focusHTMLBookmarkInVisualEditor = ed => {
		const startNode = ed.target.getDoc().getElementById( 'mce_SELREST_start' );
		const endNode = ed.target.getDoc().getElementById( 'mce_SELREST_end' );

		if ( ! startNode ) {
			return;
		}

		ed.target.focus();

		if ( ! endNode ) {
			ed.target.selection.select( startNode );
		} else {
			const selection = document.createRange();
			selection.setStart( startNode, 0 );
			selection.setEnd( endNode, 0 );

			ed.target.selection.setRng( selection );
			endNode.parentNode.removeChild( endNode );
		}

		startNode.parentNode.removeChild( startNode );

		ed.target.off( 'SetContent', this.focusHTMLBookmarkInVisualEditor );
	};

	/**
	 * Finds the current selection position in the Visual editor.
	 *
	 * It uses some black magic raw JS trickery. Not for the faint-hearted.
	 *
	 * @param {object} editor The editor where we must find the selection
	 * @returns {null | object} The selection range position in the editor
	 */
	findBookmarkedPosition = editor => {
		// Get the TinyMCE `window` reference, since we need to access the raw selection.
		const TinyMCEWIndow = editor.getWin();

		const selection = TinyMCEWIndow.getSelection();

		if ( selection.rangeCount <= 0 ) {
			// no selection, no need to continue.
			return;
		}

		/**
		 * The ID is used to avoid replacing user generated content, that may coincide with the
		 * format specified below.
		 *
		 * @type {string}
		 */
		const selectionID = 'SELRES_' + uuid();

		/**
		 * Create two marker elements that will be used to mark the start and the end of the range.
		 *
		 * The elements have hardcoded style that makes them invisible. This is done to avoid seeing
		 * random content flickering in the editor when switching between modes.
		 */
		const startElement = document.createElement( 'span' );
		startElement.className = 'mce_SELRES_start';
		startElement.style.display = 'inline-block';
		startElement.style.width = 0;
		startElement.style.overflow = 'hidden';
		startElement.style.lineHeight = '0px';
		startElement.innerHTML = selectionID;

		const endElement = document.createElement( 'span' );
		endElement.className = 'mce_SELRES_end';
		endElement.style.display = 'inline-block';
		endElement.style.width = 0;
		endElement.style.overflow = 'hidden';
		endElement.style.lineHeight = '0px';
		endElement.innerHTML = selectionID;

		/**
		 * Black magic start.
		 *
		 * Inspired by https://stackoverflow.com/a/17497803/153310
		 *
		 * Why do it this way and not with TinyMCE's bookmarks?
		 *
		 * TinyMCE's bookmarks are very nice when working with selections and positions, BUT
		 * there is no way to determine the precise position of the bookmark when switching modes, since
		 * TinyMCE does some serialization of the content, to fix things like shortcodes, run plugins, prettify
		 * HTML code and so on. In this process, the bookmark markup gets lost.
		 *
		 * If we decide to hook right after the bookmark is added, we can see where the bookmark is in the raw HTML
		 * in TinyMCE. Unfortunately this state is before the serialization, so any visual markup in the content will
		 * throw off the positioning.
		 *
		 * To avoid this, we insert two custom `span`s that will serve as the markers at the beginning and end of the
		 * selection.
		 *
		 * Why not use TinyMCE's selection API or the DOM API to wrap the contents? Because if we do that, this creates
		 * a new node, which is inserted in the dom. Now this will be fine, if we worked with fixed selections to
		 * full nodes. Unfortunately in our case, the user can select whatever they like, which means that the
		 * selection may start in the middle of one node and end in the middle of a completely different one. If we
		 * wrap the selection in another node, this will create artifacts in the content.
		 *
		 * Using the method below, we insert the custom `span` nodes at the start and at the end of the selection.
		 * This helps us not break the content and also gives us the option to work with multi-node selections without
		 * breaking the markup.
		 */
		const range = selection.getRangeAt( 0 );
		const startNode = range.startContainer;
		const startOffset = range.startOffset;
		const boundaryRange = range.cloneRange();

		boundaryRange.collapse( false );
		boundaryRange.insertNode( endElement );
		boundaryRange.setStart( startNode, startOffset );
		boundaryRange.collapse( true );
		boundaryRange.insertNode( startElement );

		range.setStartAfter( startElement );
		range.setEndBefore( endElement );
		selection.removeAllRanges();
		selection.addRange( range );

		/**
		 * Now the editor's content has the start/end nodes.
		 *
		 * Unfortunately the content goes through some more changes after this step, before it gets inserted
		 * in the `textarea`. This means that we have to do some minor cleanup on our own here.
		 */
		const content = removep( editor.getContent() );

		const startRegex = new RegExp(
			'<span[^>]*\\s*class="mce_SELRES_start"[^>]+>\\s*' + selectionID + '[^<]*<\\/span>'
		);

		const endRegex = new RegExp(
			'<span[^>]*\\s*class="mce_SELRES_end"[^>]+>\\s*' + selectionID + '[^<]*<\\/span>'
		);

		const startMatch = content.match( startRegex );
		const endMatch = content.match( endRegex );
		if ( ! startMatch ) {
			return null;
		}

		return {
			start: startMatch.index,

			// We need to adjust the end position to discard the length of the range start marker
			end: endMatch ? endMatch.index - startMatch[ 0 ].length : null,
		};
	};

	switchEditorMode = mode => {
		const content = this.editor.getContent();

		if ( mode === 'html' ) {
			const selectionRange = this.findBookmarkedPosition( this.editor._editor );

			// `this.findBookmarkedPosition` inserted some markup into the TinyMCE content.
			// Reset it back to the original.
			this.editor.setEditorContent( content );

			if ( this.state.selectedText ) {
				// Word count is not available in the HTML mode
				// This resets the word count if it exists
				this.copySelectedText();
			}

			this.editor.setSelection( selectionRange );
		} else if ( mode === 'tinymce' ) {
			this.addHTMLBookmarkInTextAreaContent();
			this.editor._editor.on( 'SetContent', this.focusHTMLBookmarkInVisualEditor );
		}

		this.props.setEditorModePreference( mode );
		this.setState( { mode }, () => {
			this.syncEditorContent( {
				resetRawContent: true,
				content,
			} );
		} );
	};
}

const enhance = flow(
	localize,
	protectForm,
	connect(
		state => {
			const siteId = getSelectedSiteId( state );
			const postId = getEditorPostId( state );
			const userId = getCurrentUserId( state );

			return {
				siteId,
				postId,
				savedPost: getSitePost( state, siteId, postId ),
				post: getEditedPost( state, siteId, postId ),
				type: getEditedPostValue( state, siteId, postId, 'type' ),
				selectedSite: getSelectedSite( state ),
				editorModePreference: getPreference( state, 'editor-mode' ),
				editorSidebarPreference: getPreference( state, 'editor-sidebar' ) || 'open',
				isNew: isEditorNewPost( state ),
				isDirty: isEditedPostDirty( state, siteId, postId ),
				hasContent: editedPostHasContent( state, siteId, postId ),
				layoutFocus: getCurrentLayoutFocus( state ),
				hasBrokenPublicizeConnection: hasBrokenSiteUserConnection( state, siteId, userId ),
				isSitePreviewable: isSitePreviewable( state, siteId ),
				isVipSite: isVipSite( state, siteId ),
				isConfirmationSidebarEnabled: isConfirmationSidebarEnabled( state, siteId ),
				isSaveBlocked: isEditorSaveBlocked( state ),
				previewUrl: getEditorPostPreviewUrl( state ),
				isAutosaving: isEditorAutosaving( state ),
				isLoading: isEditorLoading( state ),
				loadingError: getEditorLoadingError( state ),
			};
		},
		{
			autosave,
			saveEdited,
			editPost,
			setEditorModePreference: partial( savePreference, 'editor-mode' ),
			setLayoutFocus,
			setNextLayoutFocus,
			saveConfirmationSidebarPreference,
			recordTracksEvent,
			recordGoogleEvent,
			recordEditorStat,
			recordEditorEvent,
			closeEditorSidebar,
			openEditorSidebar,
			editorEditRawContent,
			editorResetRawContent,
			setEditorIframeLoaded,
			pauseGuidedTour,
		}
	)
);

export default enhance( PostEditor );
