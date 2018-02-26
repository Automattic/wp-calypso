/** @format */
/**
 * External dependencies
 */
import React from 'react';
import createReactClass from 'create-react-class';
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
import actions from 'lib/posts/actions';
import { addSiteFragment } from 'lib/route';
import PostEditStore from 'lib/posts/post-edit-store';
import EditorActionBar from 'post-editor/editor-action-bar';
import FeaturedImage from 'post-editor/editor-featured-image';
import EditorTitle from 'post-editor/editor-title';
import EditorPageSlug from 'post-editor/editor-page-slug';
import TinyMCE from 'components/tinymce';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import InvalidURLDialog from 'post-editor/invalid-url-dialog';
import RestorePostDialog from 'post-editor/restore-post-dialog';
import VerifyEmailDialog from 'components/email-verification/email-verification-dialog';
import * as utils from 'lib/posts/utils';
import EditorPreview from './editor-preview';
import { recordStat, recordEvent } from 'lib/posts/stats';
import analytics from 'lib/analytics';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { saveConfirmationSidebarPreference } from 'state/ui/editor/actions';
import { setEditorLastDraft, resetEditorLastDraft } from 'state/ui/editor/last-draft/actions';
import { closeEditorSidebar, openEditorSidebar } from 'state/ui/editor/sidebar/actions';
import {
	getEditorPostId,
	getEditorPath,
	isConfirmationSidebarEnabled,
} from 'state/ui/editor/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { editPost, receivePost, savePostSuccess } from 'state/posts/actions';
import { getEditedPostValue, getPostEdits, isEditedPostDirty } from 'state/posts/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { hasBrokenSiteUserConnection, editedPostHasContent } from 'state/selectors';
import EditorConfirmationSidebar from 'post-editor/editor-confirmation-sidebar';
import EditorDocumentHead from 'post-editor/editor-document-head';
import EditorPostTypeUnsupported from 'post-editor/editor-post-type-unsupported';
import EditorForbidden from 'post-editor/editor-forbidden';
import EditorNotice from 'post-editor/editor-notice';
import EditorWordCount from 'post-editor/editor-word-count';
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';
import QueryPreferences from 'components/data/query-preferences';
import { setLayoutFocus, setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { protectForm } from 'lib/protect-form';
import EditorSidebar from 'post-editor/editor-sidebar';
import Site from 'blocks/site';
import StatusLabel from 'post-editor/editor-status-label';
import EditorGroundControl from 'post-editor/editor-ground-control';
import { isWithinBreakpoint } from 'lib/viewport';
import { isSitePreviewable } from 'state/sites/selectors';
import { removep } from 'lib/formatting';
import QuickSaveButtons from 'post-editor/editor-ground-control/quick-save-buttons';
import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';

export const PostEditor = createReactClass( {
	displayName: 'PostEditor',

	propTypes: {
		siteId: PropTypes.number,
		preferences: PropTypes.object,
		setEditorModePreference: PropTypes.func,
		setLayoutFocus: PropTypes.func.isRequired,
		setNextLayoutFocus: PropTypes.func.isRequired,
		editorModePreference: PropTypes.string,
		editorSidebarPreference: PropTypes.string,
		editPath: PropTypes.string,
		markChanged: PropTypes.func.isRequired,
		markSaved: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		hasBrokenPublicizeConnection: PropTypes.bool,
		editPost: PropTypes.func,
		type: PropTypes.string,
	},

	_previewWindow: null,

	getInitialState() {
		return {
			...this.getPostEditState(),
			confirmationSidebar: 'closed',
			confirmationSidebarPreference: true,
			isSaving: false,
			isPublishing: false,
			notice: null,
			selectedText: null,
			showVerifyEmailDialog: false,
			showAutosaveDialog: true,
			isLoadingRevision: false,
			isTitleFocused: false,
			showPreview: false,
			isPostPublishPreview: false,
			previewAction: null,
		};
	},

	getPostEditState: function() {
		return {
			savedPost: PostEditStore.getSavedPost(),
			loadingError: PostEditStore.getLoadingError(),
			isDirty: PostEditStore.isDirty(),
			isSaveBlocked: PostEditStore.isSaveBlocked(),
			hasContent: PostEditStore.hasContent(),
			previewUrl: PostEditStore.getPreviewUrl(),
			post: PostEditStore.get(),
			isNew: PostEditStore.isNew(),
			isAutosaving: PostEditStore.isAutosaving(),
			isLoading: PostEditStore.isLoading(),
		};
	},

	componentWillMount: function() {
		PostEditStore.on( 'change', this.onEditedPostChange );
		this.debouncedSaveRawContent = debounce( this.saveRawContent, 200 );
		this.throttledAutosave = throttle( this.autosave, 20000 );
		this.debouncedAutosave = debounce( this.throttledAutosave, 3000 );
		this.switchEditorVisualMode = this.switchEditorMode.bind( this, 'tinymce' );
		this.switchEditorHtmlMode = this.switchEditorMode.bind( this, 'html' );
		this.debouncedCopySelectedText = debounce( this.copySelectedText, 200 );
		this.onPreviewClick = this.onPreview.bind( this, 'preview' );
		this.onViewClick = this.onPreview.bind( this, 'view' );
		this.useDefaultSidebarFocus();
		analytics.mc.bumpStat( 'calypso_default_sidebar_mode', this.props.editorSidebarPreference );

		this.setState( {
			isEditorInitialized: false,
		} );
	},

	componentWillUpdate( nextProps, nextState ) {
		const { isNew, savedPost, isSaving } = nextState;
		if ( ! isNew && savedPost && savedPost !== this.state.savedPost ) {
			nextProps.receivePost( savedPost );
		}

		// Cancel pending changes or autosave when user initiates a save. These
		// will have been reflected in the save payload.
		if ( isSaving && ! this.state.isSaving ) {
			this.debouncedAutosave.cancel();
			this.throttledAutosave.cancel();
		}

		if ( nextState.isDirty || nextProps.dirty ) {
			this.props.markChanged();
		} else {
			this.props.markSaved();
		}
	},

	componentDidMount: function() {
		// if content is passed in, e.g., through url param
		if ( this.state.post && this.state.post.content ) {
			this.editor.setEditorContent( this.state.post.content, { initial: true } );
		}
	},

	componentWillUnmount: function() {
		PostEditStore.removeListener( 'change', this.onEditedPostChange );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.stopEditing();

		this.debouncedAutosave.cancel();
		this.throttledAutosave.cancel();
		this.debouncedSaveRawContent.cancel();
		this.debouncedCopySelectedText.cancel();
		this._previewWindow = null;
		clearTimeout( this._switchEditorTimeout );
	},

	componentWillReceiveProps: function( nextProps ) {
		const { siteId, postId } = this.props;
		if ( nextProps.siteId === siteId && nextProps.postId !== postId ) {
			// make sure the history entry has the post ID in it, but don't dispatch
			page.replace( nextProps.editPath, null, false, false );
		}

		if (
			nextProps.siteId !== siteId ||
			( nextProps.siteId === siteId && nextProps.postId !== postId )
		) {
			this.useDefaultSidebarFocus( nextProps );
		}
	},

	storeEditor( ref ) {
		this.editor = ref;
	},

	useDefaultSidebarFocus( nextProps ) {
		const props = nextProps || this.props;
		if (
			isWithinBreakpoint( '>660px' ) &&
			( props.editorSidebarPreference === 'open' || props.hasBrokenPublicizeConnection )
		) {
			this.props.setLayoutFocus( 'sidebar' );
		}
	},

	hideNotice: function() {
		this.setState( { notice: null } );
	},

	getLayout() {
		return this.props.setLayoutFocus( 'content' );
	},

	setConfirmationSidebar: function( { status, context = null } ) {
		const allowedStatuses = [ 'closed', 'open', 'publishing' ];
		const confirmationSidebar = allowedStatuses.indexOf( status ) > -1 ? status : 'closed';
		const editorSidebarPreference =
			this.props.editorSidebarPreference === 'open' ? 'sidebar' : 'content';
		this.setState( { confirmationSidebar } );

		switch ( confirmationSidebar ) {
			case 'closed':
				this.props.setLayoutFocus( editorSidebarPreference );
				analytics.tracks.recordEvent( 'calypso_editor_confirmation_sidebar_close', { context } );
				break;
			case 'open':
				this.props.setLayoutFocus( 'editor-confirmation-sidebar' );
				analytics.tracks.recordEvent( 'calypso_editor_confirmation_sidebar_open' );
				break;
		}
	},

	copySelectedText: function() {
		const selectedText = tinyMce.activeEditor.selection.getContent() || null;
		if ( this.state.selectedText !== selectedText ) {
			this.setState( { selectedText: selectedText || null } );
		}
	},

	handleConfirmationSidebarPreferenceChange: function( event ) {
		this.setState( { confirmationSidebarPreference: event.target.checked } );
	},

	toggleSidebar: function() {
		this.props.layoutFocus === 'sidebar'
			? this.props.closeEditorSidebar()
			: this.props.openEditorSidebar();
	},

	loadRevision: function( revision ) {
		this.restoreRevision( {
			content: revision.post_content,
			excerpt: revision.post_excerpt,
			title: revision.post_title,
		} );
		if ( isWithinBreakpoint( '<660px' ) ) {
			this.props.setLayoutFocus( 'content' );
		}
	},

	render: function() {
		const site = this.props.selectedSite || undefined;
		const mode = this.getEditorMode();
		const isInvalidURL = this.state.loadingError;
		const siteURL = site ? site.URL + '/' : null;

		let isPage;
		let isTrashed;
		let hasAutosave;

		if ( this.state.post ) {
			isPage = utils.isPage( this.state.post );
			isTrashed = this.state.post.status === 'trash';
			hasAutosave = get( this.state.post.meta, [ 'data', 'autosave' ] );
		}
		const classes = classNames( 'post-editor', {
			'is-loading': ! this.state.isEditorInitialized,
		} );
		return (
			<div className={ classes }>
				<QueryPreferences />
				<EditorConfirmationSidebar
					handlePreferenceChange={ this.handleConfirmationSidebarPreferenceChange }
					onPrivatePublish={ this.onPublish }
					onPublish={ this.onPublish }
					post={ this.state.post }
					savedPost={ this.state.savedPost }
					setPostDate={ this.setPostDate }
					setStatus={ this.setConfirmationSidebar }
					status={ this.state.confirmationSidebar }
				/>
				<EditorDocumentHead />
				<EditorPostTypeUnsupported />
				<EditorForbidden />
				<EditorRevisionsDialog loadRevision={ this.loadRevision } />
				<div className="post-editor__inner">
					<EditorGroundControl
						setPostDate={ this.setPostDate }
						hasContent={ this.state.hasContent }
						isConfirmationSidebarEnabled={ this.props.isConfirmationSidebarEnabled }
						confirmationSidebarStatus={ this.state.confirmationSidebar }
						isDirty={ this.state.isDirty || this.props.dirty }
						isSaveBlocked={ this.isSaveBlocked() }
						isPublishing={ this.state.isPublishing }
						isSaving={ this.state.isSaving }
						loadRevision={ this.loadRevision }
						onPreview={ this.onPreviewClick }
						onPublish={ this.onPublish }
						onSave={ this.onSave }
						onSaveDraft={ this.props.onSaveDraft }
						post={ this.state.post }
						savedPost={ this.state.savedPost }
						site={ site }
						toggleSidebar={ this.toggleSidebar }
						onMoreInfoAboutEmailVerify={ this.onMoreInfoAboutEmailVerify }
						allPostsUrl={ this.getAllPostsUrl() }
						isSidebarOpened={ this.props.layoutFocus === 'sidebar' }
					/>
					<div className="post-editor__content">
						<div className="post-editor__content-editor">
							<EditorActionBar
								isNew={ this.state.isNew }
								onPrivatePublish={ this.onPublish }
								savedPost={ this.state.savedPost }
								site={ site }
								isPostPrivate={ utils.isPrivate( this.state.post ) }
								postAuthor={ this.state.post ? this.state.post.author : null }
							/>
							<div className="post-editor__site">
								<Site
									compact
									site={ site }
									indicator={ false }
									homeLink={ true }
									externalLink={ true }
								/>
								{ ( this.state.isDirty || this.props.dirty ) && (
									<QuickSaveButtons
										isSaving={ this.state.isSaving }
										isSaveBlocked={ this.isSaveBlocked() }
										isDirty={ this.state.isDirty || this.props.dirty }
										hasContent={ this.state.hasContent }
										loadRevision={ this.loadRevision }
										post={ this.state.post }
										onSave={ this.onSave }
									/>
								) }
								{ ! ( this.state.isDirty || this.props.dirty ) && (
									<StatusLabel post={ this.state.savedPost } />
								) }
							</div>
							<div className="post-editor__inner-content">
								<FeaturedImage
									site={ site }
									post={ this.state.post }
									maxWidth={ 1462 }
									hasDropZone={ true }
								/>
								<div className="post-editor__header">
									<EditorTitle onChange={ this.onEditorTitleChange } tabIndex={ 1 } />
									{ this.state.post && isPage && site ? (
										<EditorPageSlug
											path={
												this.state.post.URL && this.state.post.URL !== siteURL
													? utils.getPagePath( this.state.post )
													: siteURL
											}
										/>
									) : null }
									<SegmentedControl className="post-editor__switch-mode" compact={ true }>
										<SegmentedControlItem
											selected={ mode === 'tinymce' }
											onClick={ this.switchEditorVisualMode }
											title={ this.props.translate( 'Edit with a visual editor' ) }
										>
											{ this.props.translate( 'Visual', { context: 'Editor writing mode' } ) }
										</SegmentedControlItem>
										<SegmentedControlItem
											selected={ mode === 'html' }
											onClick={ this.switchEditorHtmlMode }
											title={ this.props.translate( 'Edit the raw HTML code' ) }
										>
											HTML
										</SegmentedControlItem>
									</SegmentedControl>
								</div>
								<hr className="post-editor__header-divider" />
								<TinyMCE
									ref={ this.storeEditor }
									mode={ mode }
									tabIndex={ 2 }
									isNew={ this.state.isNew }
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
						savedPost={ this.state.savedPost }
						post={ this.state.post }
						isNew={ this.state.isNew }
						onPublish={ this.onPublish }
						onTrashingPost={ this.onTrashingPost }
						site={ site }
						setPostDate={ this.setPostDate }
						onSave={ this.onSave }
						isPostPrivate={ utils.isPrivate( this.state.post ) }
						confirmationSidebarStatus={ this.state.confirmationSidebar }
					/>
					{ this.props.isSitePreviewable ? (
						<EditorPreview
							showPreview={ this.state.showPreview }
							onClose={ this.onPreviewClose }
							onEdit={ this.onPreviewEdit }
							isSaving={ this.state.isSaving || this.state.isAutosaving }
							isLoading={ this.state.isLoading }
							isFullScreen={ this.state.isPostPublishPreview }
							previewUrl={ this.getPreviewUrl() }
							postId={ this.props.postId }
							externalUrl={ this.getExternalUrl() }
							editUrl={ this.props.editPath }
							revision={ get( this.state, 'post.revisions.length', 0 ) }
						/>
					) : null }
					<EditorNotice
						{ ...this.state.notice }
						onDismissClick={ this.hideNotice }
						onViewClick={ this.onPreview }
					/>
				</div>
				{ isTrashed ? (
					<RestorePostDialog onClose={ this.onClose } onRestore={ this.onSaveTrashed } />
				) : null }
				{ this.state.showVerifyEmailDialog ? (
					<VerifyEmailDialog onClose={ this.closeVerifyEmailDialog } />
				) : null }
				{ isInvalidURL ? (
					<InvalidURLDialog post={ this.state.post } onClose={ this.onClose } />
				) : null }
				{ hasAutosave && this.state.showAutosaveDialog ? (
					<RestorePostDialog
						onRestore={ this.restoreAutosave }
						onClose={ this.closeAutosaveDialog }
						isAutosave={ true }
					/>
				) : null }
			</div>
		);
	},

	restoreAutosave: function() {
		this.setState( { showAutosaveDialog: false } );
		this.restoreRevision( get( this.state, 'post.meta.data.autosave' ) );
	},

	restoreRevision: function( revision ) {
		this.setState( { isLoadingRevision: true } );
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.edit( {
			content: revision.content,
			excerpt: revision.excerpt,
			title: revision.title,
		} );
		this.props.editPost( this.props.siteId, this.props.postId, {
			title: revision.title,
		} );
	},

	closeAutosaveDialog: function() {
		this.setState( { showAutosaveDialog: false } );
	},

	closeVerifyEmailDialog: function() {
		this.setState( { showVerifyEmailDialog: false } );
	},

	onEditedPostChange: function() {
		var didLoad = this.state.isLoading && ! PostEditStore.isLoading(),
			loadingError = PostEditStore.getLoadingError(),
			postEditState,
			post,
			site;

		if ( loadingError ) {
			this.setState( { loadingError } );
		} else if ( ( PostEditStore.isNew() && ! this.state.isNew ) || PostEditStore.isLoading() ) {
			// is new or loading
			this.setState(
				this.getInitialState(),
				() => this.editor && this.editor.setEditorContent( '' )
			);
		} else if ( this.state.isNew && this.state.hasContent && ! this.state.isDirty ) {
			// Is a copy of an existing post.
			// When copying a post, the created draft is new and the editor is not yet dirty, but it already has content.
			// Once the content is set, the editor becomes dirty and the following setState won't trigger anymore.
			this.setState(
				this.getInitialState(),
				() => this.editor && this.editor.setEditorContent( this.state.post.content )
			);
		} else {
			postEditState = this.getPostEditState();
			post = postEditState.post;
			site = this.props.selectedSite;
			if ( didLoad && site && ( this.props.type === 'page' ) !== utils.isPage( post ) ) {
				// incorrect post type in URL
				page.redirect( utils.getEditURL( post, site ) );
			}
			this.setState( postEditState, function() {
				if ( this.editor && ( didLoad || this.state.isLoadingRevision ) ) {
					this.editor.setEditorContent( this.state.post.content, { initial: true } );
				}

				if ( this.state.isLoadingRevision ) {
					this.setState( { isLoadingRevision: false } );
				}
			} );
		}
	},

	isSaveBlocked() {
		return this.state.isSaveBlocked || ! this.state.isEditorInitialized;
	},

	onEditorInitialized() {
		this.setState( { isEditorInitialized: true } );
	},

	onEditorTitleChange() {
		if ( 'open' === this.state.confirmationSidebar ) {
			this.setConfirmationSidebar( { status: 'closed', context: 'content_edit' } );
		}

		this.debouncedAutosave();
	},

	onEditorContentChange: function() {
		this.debouncedSaveRawContent();
		this.debouncedAutosave();
	},

	onEditorTextContentChange: function() {
		if ( 'open' === this.state.confirmationSidebar ) {
			this.setConfirmationSidebar( { status: 'closed', context: 'content_edit' } );
		}

		this.debouncedSaveRawContent();
		this.debouncedAutosave();
	},

	onEditorKeyUp: function() {
		if ( 'open' === this.state.confirmationSidebar ) {
			this.setConfirmationSidebar( { status: 'closed', context: 'content_edit' } );
		}

		this.debouncedCopySelectedText();
		this.debouncedSaveRawContent();
	},

	onEditorFocus: function() {
		// Fire a click when the editor is focused so that any global handlers have an opportunity to do their thing.
		// In particular, this ensures that open popovers are closed when a user clicks into the editor.
		ReactDom.findDOMNode( this.editor ).click();
	},

	saveRawContent: function() {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.editRawContent( this.editor.getContent( { format: 'raw' } ) );

		// If debounced save raw content was pending, consider it flushed
		this.debouncedSaveRawContent.cancel();
	},

	autosave: function() {
		var callback;

		if ( this.state.isSaving === true || this.isSaveBlocked() ) {
			return;
		}

		this.saveRawContent();
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		const edits = {
			...this.props.edits,
			content: this.editor.getContent(),
		};
		actions.edit( edits );

		// Make sure that after TinyMCE processing that the post is still dirty
		if ( ! PostEditStore.isDirty() || ! PostEditStore.hasContent() || ! this.state.post ) {
			return;
		}

		if ( utils.isPublished( this.state.savedPost ) || utils.isPublished( this.state.post ) ) {
			callback = function() {};
		} else {
			this.setState( { isSaving: true } );
			callback = function( error ) {
				if ( error && 'NO_CHANGE' !== error.message ) {
					this.onSaveDraftFailure( error );
				} else {
					this.onSaveDraftSuccess();
				}
			}.bind( this );
		}

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.autosave( this.props.selectedSite, callback );

		// If debounced / throttled autosave was pending, consider it flushed
		this.throttledAutosave.cancel();
		this.debouncedAutosave.cancel();
	},

	onClose: function() {
		// go back if we can, if not, hit all posts
		page.back( this.getAllPostsUrl() );
	},

	getAllPostsUrl: function() {
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

		if ( site ) {
			path = addSiteFragment( path, site.slug );
		}

		return path;
	},

	onMoreInfoAboutEmailVerify: function() {
		this.setState( {
			showVerifyEmailDialog: true,
		} );
	},

	onTrashingPost: function( error ) {
		var isPage = utils.isPage( this.state.post );

		if ( error ) {
			this.setState( {
				notice: {
					status: 'is-error',
					message: 'trashFailure',
				},
			} );
		} else {
			recordStat( isPage ? 'page_trashed' : 'post_trashed' );
			recordEvent( isPage ? 'Clicked Trash Page Button' : 'Clicked Trash Post Button' );
			this.props.markSaved();
		}
	},

	onSaveTrashed: function( status, callback ) {
		this.onSave( status, callback );
	},

	onSave: function( status, callback ) {
		const edits = { ...this.props.edits };
		if ( status ) {
			edits.status = status;
		}

		if (
			! utils.isPublished( this.state.savedPost ) &&
			( ( ! status && utils.isPublished( this.state.post ) ) || utils.isPublished( edits ) )
		) {
			return;
		}

		// Flush any pending raw content saves
		this.saveRawContent();

		edits.content = this.editor.getContent();

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.saveEdited(
			this.props.selectedSite,
			edits,
			{ isConfirmationSidebarEnabled: this.props.isConfirmationSidebarEnabled },
			function( error ) {
				if ( error && 'NO_CHANGE' !== error.message ) {
					this.onSaveDraftFailure( error );
				} else {
					this.onSaveDraftSuccess();
				}

				if ( 'function' === typeof callback ) {
					callback( error );
				}
			}.bind( this )
		);

		this.setState( { isSaving: true } );
	},

	getPreviewUrl: function() {
		const { post, previewAction, previewUrl } = this.state;

		if ( previewAction === 'view' && post ) {
			return post.URL;
		}

		return previewUrl;
	},

	getExternalUrl: function() {
		const { post } = this.state;

		if ( post ) {
			return post.URL;
		}

		return this.getPreviewUrl();
	},

	onPreview: function( action, event ) {
		var status = 'draft',
			previewPost;

		if ( this.state.previewAction !== action ) {
			this.setState( {
				previewAction: action,
			} );
		}

		if ( this.props.isSitePreviewable && ! event.metaKey && ! event.ctrlKey ) {
			return this.iframePreview();
		}

		if ( ! this._previewWindow || this._previewWindow.closed ) {
			this._previewWindow = window.open( 'about:blank', 'WordPress.com Post Preview' );
		}

		if ( this.state.savedPost && this.state.savedPost.status ) {
			status = this.state.savedPost.status;
		}

		previewPost = function() {
			if ( this._previewWindow ) {
				this._previewWindow.location = this.getPreviewUrl();
				this._previewWindow.focus();
			} else {
				this._previewWindow = window.open( this.getPreviewUrl(), 'WordPress.com Post Preview' );
			}
		}.bind( this );

		if ( status === 'publish' ) {
			// TODO: REDUX - remove flux actions when whole post-editor is reduxified
			actions.edit( { content: this.editor.getContent() } );
			actions.autosave( this.props.selectedSite, previewPost );
		} else {
			this.onSave( null, previewPost );
		}
	},

	iframePreview: function() {
		if ( this.state.isDirty || this.props.dirty ) {
			this.autosave();
			// to avoid a weird UX we clear the iframe when (auto)saving
			// so we need to delay opening it a bit to avoid flickering
			setTimeout(
				function() {
					this.setState( { showPreview: true } );
				}.bind( this ),
				150
			);
		} else {
			this.setState( { showPreview: true } );
		}
	},

	onPreviewClose: function() {
		if ( this.state.isPostPublishPreview ) {
			page.back( this.getAllPostsUrl() );
		} else {
			this.setState( {
				showPreview: false,
				isPostPublishPreview: false,
				previewAction: null,
			} );
		}
	},

	onPreviewEdit: function() {
		if ( this.props.editorSidebarPreference === 'open' ) {
			// When returning to the editor from the preview, set the "next
			// layout focus" to the sidebar if the editor sidebar should be
			// visible.  Otherwise, according to its default behavior, the
			// LAYOUT_NEXT_FOCUS_ACTIVATE action will cause the 'content'
			// layout area to be activated, which hides the editor sidebar.
			this.props.setNextLayoutFocus( 'sidebar' );
		}

		this.setState( {
			showPreview: false,
			isPostPublishPreview: false,
			previewAction: null,
		} );

		return false;
	},

	onSaveDraftFailure: function( error ) {
		this.onSaveFailure( error, 'saveFailure' );
	},

	onSaveDraftSuccess: function() {
		const { post } = this.state;

		if ( utils.isPublished( post ) ) {
			this.onSaveSuccess( 'updated' );
		} else {
			this.onSaveSuccess();
		}
	},

	onPublish: function( isConfirmed = false ) {
		const edits = {
			...this.props.edits,
			status: 'publish',
		};

		if ( this.props.isConfirmationSidebarEnabled && false === isConfirmed ) {
			this.setConfirmationSidebar( { status: 'open' } );
			return;
		}

		if ( this.props.isConfirmationSidebarEnabled && 'open' === this.state.confirmationSidebar ) {
			this.setConfirmationSidebar( { status: 'publishing' } );
		}

		// determine if this is a private publish
		if ( utils.isPrivate( this.state.post ) ) {
			edits.status = 'private';
		} else if ( utils.isFutureDated( this.state.post ) ) {
			edits.status = 'future';
		}

		// Flush any pending raw content saves
		this.saveRawContent();

		// Update content on demand to avoid unnecessary lag and because it is expensive
		// to serialize when TinyMCE is the active mode
		edits.content = this.editor.getContent();

		actions.saveEdited(
			this.props.selectedSite,
			edits,
			{ isConfirmationSidebarEnabled: this.props.isConfirmationSidebarEnabled },
			function( error ) {
				if ( error && 'NO_CHANGE' !== error.message ) {
					this.onPublishFailure( error );
				} else {
					this.onPublishSuccess();
				}
			}.bind( this )
		);

		this.setState( {
			isSaving: true,
			isPublishing: true,
		} );
	},

	onPublishFailure: function( error ) {
		this.onSaveFailure( error, 'publishFailure' );

		if ( this.props.isConfirmationSidebarEnabled ) {
			this.setConfirmationSidebar( { status: 'closed', context: 'publish_failure' } );
		}
	},

	onPublishSuccess: function() {
		const { savedPost } = this.state;

		let message;
		if ( utils.isPrivate( savedPost ) ) {
			message = 'publishedPrivately';
		} else if ( utils.isFutureDated( savedPost ) ) {
			message = 'scheduled';
		} else {
			message = 'published';
		}

		if ( ! this.state.confirmationSidebarPreference ) {
			this.props.saveConfirmationSidebarPreference( this.props.siteId, false );
		}

		if ( this.props.isConfirmationSidebarEnabled ) {
			this.setConfirmationSidebar( { status: 'closed', context: 'publish_success' } );
		}

		this.onSaveSuccess( message );
	},

	onSaveFailure: function( error, message ) {
		this.setState( {
			isSaving: false,
			isPublishing: false,
			notice: {
				status: 'is-error',
				error,
				message,
			},
		} );

		window.scrollTo( 0, 0 );
	},

	setPostDate: function( date ) {
		const { siteId, postId } = this.props;
		const dateValue = date ? date.format() : null;
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.edit( { date: dateValue } );

		if ( siteId && postId ) {
			this.props.editPost( siteId, postId, { date: dateValue } );
		}

		analytics.tracks.recordEvent( 'calypso_editor_publish_date_change', {
			context: 'open' === this.state.confirmationSidebar ? 'confirmation-sidebar' : 'post-settings',
		} );

		this.checkForDateChange( dateValue );
	},

	checkForDateChange( date ) {
		const { savedPost } = this.state;

		if ( ! savedPost ) {
			return;
		}

		const currentDate = this.props.moment( date );
		const modifiedDate = this.props.moment( savedPost.date );
		const dateChange = ! (
			currentDate.get( 'date' ) === modifiedDate.get( 'date' ) &&
			currentDate.get( 'month' ) === modifiedDate.get( 'month' ) &&
			currentDate.get( 'year' ) === modifiedDate.get( 'year' )
		);
		const diff = !! currentDate.diff( modifiedDate ) && !! dateChange;

		if ( savedPost.type === 'post' && utils.isPublished( savedPost ) && diff ) {
			this.warnPublishDateChange();
		} else {
			this.warnPublishDateChange( { clearWarning: true } );
		}
	},

	// when a post that is published, modifies its date, this updates the post url
	// we should warn users of this case
	warnPublishDateChange( { clearWarning = false } = {} ) {
		if ( clearWarning ) {
			if ( get( this.state, 'notice.message' ) === 'warnPublishDateChange' ) {
				this.hideNotice();
			}
			return;
		}
		this.setState( {
			notice: {
				status: 'is-warning',
				message: 'warnPublishDateChange',
			},
		} );
	},

	onSaveSuccess: function( message ) {
		const post = PostEditStore.get();
		const isNotPrivateOrIsConfirmed =
			'private' !== post.status || 'closed' !== this.state.confirmationSidebar;

		if ( 'draft' === post.status ) {
			this.props.setEditorLastDraft( post.site_ID, post.ID );
		} else {
			this.props.resetEditorLastDraft();
		}

		// Remove this when the editor is completely reduxified ( When using Redux actions for all post saving requests )
		this.props.savePostSuccess( post.site_ID, this.props.postId, post, {} );

		// Receive updated post into state
		this.props.receivePost( post );

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

			if ( this.props.isSitePreviewable && isNotPrivateOrIsConfirmed && 'published' === message ) {
				this.setState( { isPostPublishPreview: true } );
				this.iframePreview();
			}
		} else {
			nextState.notice = null;
		}

		this.setState( nextState );
	},

	getEditorMode: function() {
		var editorMode = 'tinymce';
		if ( this.props.editorModePreference ) {
			editorMode = this.props.editorModePreference;

			if ( ! this.recordedDefaultEditorMode ) {
				analytics.mc.bumpStat( 'calypso_default_editor_mode', editorMode );
				this.recordedDefaultEditorMode = true;
			}
		}
		return editorMode;
	},

	getContainingTagInfo: function( content, cursorPosition ) {
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
	},

	getCursorMarkerSpan: function( type ) {
		const tagType = type ? type : 'start';

		return `<span
				data-mce-type="bookmark"
				id="mce_SELREST_${ tagType }"
				data-mce-style="overflow:hidden;line-height:0"
				style="overflow:hidden;line-height:0"
			>&#65279;</span>`;
	},

	addHTMLBookmarkInTextAreaContent: function() {
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
	},

	focusHTMLBookmarkInVisualEditor: function( ed ) {
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
	},

	/**
	 * Finds the current selection position in the Visual editor.
	 *
	 * It uses some black magic raw JS trickery. Not for the faint-hearted.
	 *
	 * @param {Object} editor The editor where we must find the selection
	 * @returns {null | Object} The selection range position in the editor
	 */
	findBookmarkedPosition: function( editor ) {
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
	},

	switchEditorMode: function( mode ) {
		const content = this.editor.getContent();

		if ( mode === 'html' ) {
			const selectionRange = this.findBookmarkedPosition( this.editor._editor );

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

		// Defer actions until next available tick to avoid
		// dispatching inside a dispatch which can happen if for example the
		// title field is focused when toggling the editor.
		this._switchEditorTimeout = setTimeout(
			function() {
				// TODO: REDUX - remove flux actions when whole post-editor is reduxified
				actions.edit( { content: content } );
				actions.resetRawContent();

				if ( mode === 'html' ) {
					// Set raw content directly to avoid race conditions
					actions.editRawContent( content );
				} else {
					this.saveRawContent();
				}
			}.bind( this ),
			0
		);
	},
} );

const enhance = flow(
	localize,
	protectForm,
	connect(
		state => {
			const siteId = getSelectedSiteId( state );
			const postId = getEditorPostId( state );
			const userId = getCurrentUserId( state );
			const type = getEditedPostValue( state, siteId, postId, 'type' );

			return {
				siteId,
				postId,
				type,
				selectedSite: getSelectedSite( state ),
				editorModePreference: getPreference( state, 'editor-mode' ),
				editorSidebarPreference: getPreference( state, 'editor-sidebar' ) || 'open',
				editPath: getEditorPath( state, siteId, postId ),
				edits: getPostEdits( state, siteId, postId ),
				dirty: isEditedPostDirty( state, siteId, postId ),
				hasContent: editedPostHasContent( state, siteId, postId ),
				layoutFocus: getCurrentLayoutFocus( state ),
				hasBrokenPublicizeConnection: hasBrokenSiteUserConnection( state, siteId, userId ),
				isSitePreviewable: isSitePreviewable( state, siteId ),
				isConfirmationSidebarEnabled: isConfirmationSidebarEnabled( state, siteId ),
			};
		},
		{
			setEditorLastDraft,
			resetEditorLastDraft,
			receivePost,
			editPost,
			savePostSuccess,
			setEditorModePreference: partial( savePreference, 'editor-mode' ),
			setLayoutFocus,
			setNextLayoutFocus,
			saveConfirmationSidebarPreference,
			recordTracksEvent,
			closeEditorSidebar,
			openEditorSidebar,
		}
	)
);

export default enhance( PostEditor );
