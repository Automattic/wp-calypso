/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import page from 'page';
import PropTypes from 'prop-types';
import { debounce, throttle, get } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import tinyMce from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
import actions from 'lib/posts/actions';
import route from 'lib/route';
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
import utils from 'lib/posts/utils';
import EditorPreview from './editor-preview';
import { recordStat, recordEvent } from 'lib/posts/stats';
import analytics from 'lib/analytics';
import config from 'config';
import { abtest } from 'lib/abtest';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { saveConfirmationSidebarPreference } from 'state/ui/editor/actions';
import { setEditorLastDraft, resetEditorLastDraft } from 'state/ui/editor/last-draft/actions';
import { getEditorPostId, getEditorPath, isConfirmationSidebarEnabled } from 'state/ui/editor/selectors';
import { editPost, receivePost, savePostSuccess } from 'state/posts/actions';
import { getPostEdits, isEditedPostDirty } from 'state/posts/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { hasBrokenSiteUserConnection } from 'state/selectors';
import EditorConfirmationSidebar from 'post-editor/editor-confirmation-sidebar';
import EditorDocumentHead from 'post-editor/editor-document-head';
import EditorPostTypeUnsupported from 'post-editor/editor-post-type-unsupported';
import EditorForbidden from 'post-editor/editor-forbidden';
import EditorNotice from 'post-editor/editor-notice';
import EditorWordCount from 'post-editor/editor-word-count';
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';
import QueryPreferences from 'components/data/query-preferences';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { protectForm } from 'lib/protect-form';
import EditorSidebar from 'post-editor/editor-sidebar';
import Site from 'blocks/site';
import StatusLabel from 'post-editor/editor-status-label';
import { editedPostHasContent } from 'state/selectors';
import EditorGroundControl from 'post-editor/editor-ground-control';
import { isWithinBreakpoint } from 'lib/viewport';
import { isSitePreviewable } from 'state/sites/selectors';
import EditorDiffViewer from 'post-editor/editor-diff-viewer';
import { NESTED_SIDEBAR_NONE, NESTED_SIDEBAR_REVISIONS } from 'post-editor/editor-sidebar/constants';

export const PostEditor = React.createClass( {
	propTypes: {
		siteId: PropTypes.number,
		preferences: PropTypes.object,
		setEditorModePreference: PropTypes.func,
		setEditorSidebar: PropTypes.func,
		setLayoutFocus: PropTypes.func.isRequired,
		editorModePreference: PropTypes.string,
		editorSidebarPreference: PropTypes.string,
		user: PropTypes.object,
		userUtils: PropTypes.object,
		editPath: PropTypes.string,
		markChanged: PropTypes.func.isRequired,
		markSaved: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		hasBrokenPublicizeConnection: PropTypes.bool,
		editPost: PropTypes.func,
	},

	_previewWindow: null,

	isPostPublishConfirmationABTest: abtest( 'postPublishConfirmation' ) === 'showPublishConfirmation',

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
			nestedSidebar: NESTED_SIDEBAR_NONE,
			selectedRevisionId: null,
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
			isLoading: PostEditStore.isLoading()
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
			isEditorInitialized: false
		} );
	},

	componentDidUpdate( prevProps, prevState ) {
		if (
			prevState.nestedSidebar !== NESTED_SIDEBAR_NONE &&
			this.state.nestedSidebar === NESTED_SIDEBAR_NONE
		) {
			// NOTE: Make sure we scroll back to the top AND trigger a scroll
			// event no matter the scroll position we're coming from.
			// ( used to force-reset TinyMCE toolbar )
			window.scrollTo( 0, 1 );
			window.scrollTo( 0, 0 );
		}
	},

	componentWillUpdate( nextProps, nextState ) {
		const { isNew, savedPost } = nextState;
		if ( ! isNew && savedPost && savedPost !== this.state.savedPost ) {
			nextProps.receivePost( savedPost );
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

		if ( nextProps.siteId !== siteId ||
			( nextProps.siteId === siteId && nextProps.postId !== postId ) ) {
			this.useDefaultSidebarFocus( nextProps );
		}
	},

	storeEditor( ref ) {
		this.editor = ref;
	},

	useDefaultSidebarFocus( nextProps ) {
		const props = nextProps || this.props;
		if ( isWithinBreakpoint( '>660px' ) && ( props.editorSidebarPreference === 'open' || props.hasBrokenPublicizeConnection ) ) {
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
		const editorSidebarPreference = this.props.editorSidebarPreference === 'open' ? 'sidebar' : 'content';
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
		if ( this.props.layoutFocus === 'sidebar' ) {
			this.props.setEditorSidebar( 'closed' );
			this.props.setLayoutFocus( 'content' );
			recordStat( 'close-sidebar' );
			recordEvent( 'Sidebar Toggle', 'close' );
		} else {
			this.props.setEditorSidebar( 'open' );
			this.props.setLayoutFocus( 'sidebar' );
			recordStat( 'open-sidebar' );
			recordEvent( 'Sidebar Toggle', 'open' );
		}
	},

	setNestedSidebar: function( nestedSidebar ) {
		if (
			this.state.nestedSidebar === NESTED_SIDEBAR_REVISIONS &&
			this.state.nestedSidebar !== nestedSidebar
		) {
			this.selectRevision( null );
		}

		this.setState( { nestedSidebar } );
	},

	selectRevision: function( selectedRevisionId ) {
		this.setState( { selectedRevisionId } );
		if (
			selectedRevisionId !== null &&
			isWithinBreakpoint( '<660px' )
		) {
			this.props.setLayoutFocus( 'content' );
		}
	},

	loadRevision: function( revision ) {
		this.setNestedSidebar( NESTED_SIDEBAR_NONE );
		this.setState( { selectedRevisionId: null } );
		this.restoreRevision( {
			content: revision.content,
			excerpt: revision.excerpt,
			title: revision.title,
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
		const isConfirmationFeatureEnabled = (
			config.isEnabled( 'post-editor/delta-post-publish-flow' ) &&
			this.isPostPublishConfirmationABTest &&
			this.props.isConfirmationSidebarEnabled
		);

		let isPage;
		let isTrashed;
		let hasAutosave;

		if ( this.state.post ) {
			isPage = utils.isPage( this.state.post );
			isTrashed = this.state.post.status === 'trash';
			hasAutosave = get( this.state.post.meta, [ 'data', 'autosave' ] );
		}
		const classes = classNames( 'post-editor', {
			'is-loading': ! this.state.isEditorInitialized
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
					site={ site }
					status={ this.state.confirmationSidebar }
				/>
				<EditorDocumentHead />
				<EditorPostTypeUnsupported />
				<EditorForbidden />
				<div className="post-editor__inner">
					<EditorGroundControl
						setPostDate={ this.setPostDate }
						hasContent={ this.state.hasContent }
						isConfirmationSidebarEnabled={ isConfirmationFeatureEnabled }
						confirmationSidebarStatus={ this.state.confirmationSidebar }
						isDirty={ this.state.isDirty || this.props.dirty }
						isSaveBlocked={ this.isSaveBlocked() }
						isPublishing={ this.state.isPublishing }
						isSaving={ this.state.isSaving }
						onPreview={ this.onPreviewClick }
						onPublish={ this.onPublish }
						onSave={ this.onSave }
						onSaveDraft={ this.props.onSaveDraft }
						post={ this.state.post }
						savedPost={ this.state.savedPost }
						site={ site }
						user={ this.props.user }
						userUtils={ this.props.userUtils }
						toggleSidebar={ this.toggleSidebar }
						type={ this.props.type }
						onMoreInfoAboutEmailVerify={ this.onMoreInfoAboutEmailVerify }
						allPostsUrl={ this.getAllPostsUrl() }
						nestedSidebar={ this.state.nestedSidebar }
					/>
					<div className="post-editor__content">
						<div className="post-editor__content-editor">
							<EditorActionBar
								isNew={ this.state.isNew }
								onPrivatePublish={ this.onPublish }
								savedPost={ this.state.savedPost }
								site={ site }
								type={ this.props.type }
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
								<StatusLabel
									post={ this.state.savedPost }
									type={ this.props.type }
								/>
							</div>
							<div className={ classNames(
								'post-editor__inner-content',
								{ 'is-shown': this.state.nestedSidebar === NESTED_SIDEBAR_NONE }
							) }>
								<FeaturedImage
									site={ site }
									post={ this.state.post }
									maxWidth={ 1462 } />
								<div className="post-editor__header">
									<EditorTitle
										onChange={ this.onEditorTitleChange }
										tabIndex={ 1 } />
									{ this.state.post && isPage && site
										? <EditorPageSlug
											path={ this.state.post.URL && ( this.state.post.URL !== siteURL )
												? utils.getPagePath( this.state.post )
												: siteURL
											}
											/>
										: null
									}
									<SegmentedControl className="post-editor__switch-mode" compact={ true }>
										<SegmentedControlItem
											selected={ mode === 'tinymce' }
											onClick={ this.switchEditorVisualMode }
											title={ this.props.translate( 'Edit with a visual editor' ) }>
											{ this.props.translate( 'Visual', { context: 'Editor writing mode' } ) }
										</SegmentedControlItem>
										<SegmentedControlItem
											selected={ mode === 'html' }
											onClick={ this.switchEditorHtmlMode }
											title={ this.props.translate( 'Edit the raw HTML code' ) }>
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
									onTextEditorChange={ this.onEditorTextContentChange } />
								<EditorWordCount
									selectedText={ this.state.selectedText }
								/>
							</div>
							{ this.state.nestedSidebar === NESTED_SIDEBAR_REVISIONS && (
								<EditorDiffViewer
									siteId={ site.ID }
									postId={ this.state.post.ID }
									selectedRevisionId={ this.state.selectedRevisionId }
								/>
							) }
						</div>
					</div>
					<EditorSidebar
						toggleSidebar={ this.toggleSidebar }
						savedPost={ this.state.savedPost }
						post={ this.state.post }
						isNew={ this.state.isNew }
						onPublish={ this.onPublish }
						onTrashingPost={ this.onTrashingPost }
						site={ site }
						type={ this.props.type }
						setPostDate={ this.setPostDate }
						onSave={ this.onSave }
						isPostPrivate={ utils.isPrivate( this.state.post ) }
						confirmationSidebarStatus={ this.state.confirmationSidebar }
						setNestedSidebar={ this.setNestedSidebar }
						nestedSidebar={ this.state.nestedSidebar }
						loadRevision={ this.loadRevision }
						selectedRevisionId={ this.state.selectedRevisionId }
						selectRevision={ this.selectRevision }
						/>
					{ this.props.isSitePreviewable
						? <EditorPreview
							showPreview={ this.state.showPreview }
							onClose={ this.onPreviewClose }
							onEdit={ this.onPreviewEdit }
							isSaving={ this.state.isSaving || this.state.isAutosaving }
							isLoading={ this.state.isLoading }
							isFullScreen={ this.state.isPostPublishPreview }
							previewUrl={ this.getPreviewUrl() }
							externalUrl={ this.getExternalUrl() }
							editUrl={ this.props.editPath }
							defaultViewportDevice={ this.state.isPostPublishPreview ? 'computer' : 'tablet' }
							revision={ get( this.state, 'post.revisions.length', 0 ) }
						/>
						: null }
					<EditorNotice
						{ ...this.state.notice }
						onDismissClick={ this.hideNotice }
						onViewClick={ this.onPreview } />
				</div>
				{ isTrashed
					? <RestorePostDialog
						onClose={ this.onClose }
						onRestore={ this.onSaveTrashed }
					/>
				: null }
				{ this.state.showVerifyEmailDialog
					? <VerifyEmailDialog
						onClose={ this.closeVerifyEmailDialog }
					/>
				: null }
				{ isInvalidURL
					? <InvalidURLDialog
						post={ this.state.post }
						onClose={ this.onClose }
					/>
				: null }
				{ hasAutosave && this.state.showAutosaveDialog
					? <RestorePostDialog
						onRestore={ this.restoreAutosave }
						onClose={ this.closeAutosaveDialog }
						isAutosave={ true }
					/>
				: null }
			</div>
		);
	},

	restoreAutosave: function() {
		this.setState( { showAutosaveDialog: false } );
		this.restoreRevision( this.state.post.meta.data.autosave );
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
			postEditState, post, site;

		if ( loadingError ) {
			this.setState( { loadingError } );
		} else if ( ( PostEditStore.isNew() && ! this.state.isNew ) || PostEditStore.isLoading() ) {
			// is new or loading
			this.setState( this.getInitialState(), () => this.editor && this.editor.setEditorContent( '' ) );
		} else if ( this.state.isNew && this.state.hasContent && ! this.state.isDirty ) {
			// Is a copy of an existing post.
			// When copying a post, the created draft is new and the editor is not yet dirty, but it already has content.
			// Once the content is set, the editor becomes dirty and the following setState won't trigger anymore.
			this.setState( this.getInitialState(), () => this.editor && this.editor.setEditorContent( this.state.post.content ) );
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
			content: this.editor.getContent()
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
		actions.autosave( callback );
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
			case 'page': path = '/pages'; break;
			case 'post': path = '/posts'; break;
			default: path = `/types/${ type }`;
		}

		if ( type === 'post' && site && ! site.jetpack && ! site.single_user_site ) {
			path += '/my';
		}

		if ( site ) {
			path = route.addSiteFragment( path, site.slug );
		}

		return path;
	},

	onMoreInfoAboutEmailVerify: function() {
		this.setState( {
			showVerifyEmailDialog: true
		} );
	},

	onTrashingPost: function( error ) {
		var isPage = utils.isPage( this.state.post );

		if ( error ) {
			this.setState( {
				notice: {
					status: 'is-error',
					message: 'trashFailure'
				}
			} );
		} else {
			recordStat( isPage ? 'page_trashed' : 'post_trashed' );
			recordEvent( isPage ? 'Clicked Trash Page Button' : 'Clicked Trash Post Button' );
			this.props.markSaved();
			this.onClose();
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

		if ( ! utils.isPublished( this.state.savedPost ) &&
			( ! status && utils.isPublished( this.state.post ) || utils.isPublished( edits ) ) ) {
			return;
		}

		edits.content = this.editor.getContent();

		const isConfirmationFeatureEnabled = (
			config.isEnabled( 'post-editor/delta-post-publish-flow' ) &&
			this.props.isConfirmationSidebarEnabled
		);

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.saveEdited( edits, { isConfirmationFeatureEnabled: isConfirmationFeatureEnabled }, function( error ) {
			if ( error && 'NO_CHANGE' !== error.message ) {
				this.onSaveDraftFailure( error );
			} else {
				this.onSaveDraftSuccess();
			}

			if ( 'function' === typeof callback ) {
				callback( error );
			}
		}.bind( this ) );

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
				previewAction: action
			} );
		}

		if ( this.props.isSitePreviewable && ! event.metaKey && ! event.ctrlKey ) {
			return this.iframePreview();
		}

		if ( ! this._previewWindow || this._previewWindow.closed ) {
			this._previewWindow	= window.open( 'about:blank', 'WordPress.com Post Preview' );
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
			actions.autosave( previewPost );
		} else {
			this.onSave( null, previewPost );
		}
	},

	iframePreview: function() {
		if ( this.state.isDirty || this.props.dirty ) {
			this.autosave();
			// to avoid a weird UX we clear the iframe when (auto)saving
			// so we need to delay opening it a bit to avoid flickering
			setTimeout( function() {
				this.setState( { showPreview: true } );
			}.bind( this ), 150 );
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
			status: 'publish'
		};

		const isConfirmationFeatureEnabled = (
			config.isEnabled( 'post-editor/delta-post-publish-flow' ) &&
			this.isPostPublishConfirmationABTest &&
			this.props.isConfirmationSidebarEnabled
		);

		if (
			isConfirmationFeatureEnabled &&
			false === isConfirmed
		) {
			this.setConfirmationSidebar( { status: 'open' } );
			return;
		}

		if (
			isConfirmationFeatureEnabled &&
			'open' === this.state.confirmationSidebar
		) {
			this.setConfirmationSidebar( { status: 'publishing' } );
		}

		// determine if this is a private publish
		if ( utils.isPrivate( this.state.post ) ) {
			edits.status = 'private';
		} else if ( utils.isFutureDated( this.state.post ) ) {
			edits.status = 'future';
		}

		// Update content on demand to avoid unnecessary lag and because it is expensive
		// to serialize when TinyMCE is the active mode
		edits.content = this.editor.getContent();

		actions.saveEdited( edits, { isConfirmationFeatureEnabled: isConfirmationFeatureEnabled }, function( error ) {
			if ( error && 'NO_CHANGE' !== error.message ) {
				this.onPublishFailure( error );
			} else {
				this.onPublishSuccess();
			}
		}.bind( this ) );

		this.setState( {
			isSaving: true,
			isPublishing: true
		} );
	},

	onPublishFailure: function( error ) {
		this.onSaveFailure( error, 'publishFailure' );

		if (
			config.isEnabled( 'post-editor/delta-post-publish-flow' ) &&
			this.isPostPublishConfirmationABTest &&
			this.props.isConfirmationSidebarEnabled
		) {
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

		if (
			config.isEnabled( 'post-editor/delta-post-publish-flow' ) &&
			this.isPostPublishConfirmationABTest &&
			this.props.isConfirmationSidebarEnabled
		) {
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
				message
			}
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

		if (
			config.isEnabled( 'post-editor/delta-post-publish-flow' ) &&
			this.isPostPublishConfirmationABTest
		) {
			analytics.tracks.recordEvent( 'calypso_editor_publish_date_change', {
				context: 'open' === this.state.confirmationSidebar ? 'confirmation-sidebar' : 'post-settings',
			} );
		}

		this.checkForDateChange( dateValue );
	},

	checkForDateChange( date ) {
		const { savedPost } = this.state;

		if ( ! savedPost ) {
			return;
		}

		const currentDate = this.moment( date );
		const modifiedDate = this.moment( savedPost.date );
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
				message: 'warnPublishDateChange'
			}
		} );
	},

	onSaveSuccess: function( message ) {
		const post = PostEditStore.get();
		const isNotPrivateOrIsConfirmed = ( 'private' !== post.status ) || ( 'closed' !== this.state.confirmationSidebar );

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
			isPublishing: false
		};

		if ( message ) {
			nextState.notice = {
				status: 'is-success',
				message,
			};

			window.scrollTo( 0, 0 );

			if (
				this.props.isSitePreviewable &&
				isNotPrivateOrIsConfirmed
			) {
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

	switchEditorMode: function( mode ) {
		const content = this.editor.getContent();

		if ( mode === 'html' ) {
			this.editor.setEditorContent( content );

			if ( this.state.selectedText ) {
				// Word count is not available in the HTML mode
				// This resets the word count if it exists
				this.copySelectedText();
			}
		}

		this.props.setEditorModePreference( mode );

		// Defer actions until next available tick to avoid
		// dispatching inside a dispatch which can happen if for example the
		// title field is focused when toggling the editor.
		this._switchEditorTimeout = setTimeout( function() {
			// TODO: REDUX - remove flux actions when whole post-editor is reduxified
			actions.edit( { content: content } );

			if ( mode === 'html' ) {
				// Set raw content directly to avoid race conditions
				actions.editRawContent( content );
			} else {
				this.saveRawContent();
			}
		}.bind( this ), 0 );
	}

} );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const userId = getCurrentUserId( state );

		return {
			siteId,
			postId,
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
	( dispatch ) => {
		return bindActionCreators( {
			editPost,
			setEditorLastDraft,
			resetEditorLastDraft,
			receivePost,
			editPost,
			savePostSuccess,
			setEditorModePreference: savePreference.bind( null, 'editor-mode' ),
			setEditorSidebar: savePreference.bind( null, 'editor-sidebar' ),
			setLayoutFocus,
			saveConfirmationSidebarPreference,
		}, dispatch );
	},
	null,
	{ pure: false }
)( protectForm( localize( PostEditor ) ) );
