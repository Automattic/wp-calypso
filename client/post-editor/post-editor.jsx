/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	debug = require( 'debug' )( 'calypso:post-editor' ),
	page = require( 'page' ),
	classnames = require( 'classnames' ),
	debounce = require( 'lodash/function/debounce' ),
	throttle = require( 'lodash/function/throttle' ),
	assign = require( 'lodash/object/assign' );

/**
 * Internal dependencies
 */
var actions = require( 'lib/posts/actions' ),
	config = require( 'config' ),
	route = require( 'lib/route' ),
	PostEditStore = require( 'lib/posts/post-edit-store' ),
	EditorActionBar = require( 'post-editor/editor-action-bar' ),
	EditorDrawer = require( 'post-editor/editor-drawer' ),
	FeaturedImage = require( 'post-editor/editor-featured-image' ),
	EditorGroundControl = require( 'post-editor/editor-ground-control' ),
	EditorTitleContainer = require( 'post-editor/editor-title/container' ),
	EditorPageSlug = require( 'post-editor/editor-page-slug' ),
	Gridicon = require( 'components/gridicon' ),
	NoticeAction = require( 'components/notice/notice-action' ),
	Notice = require( 'components/notice' ),
	protectForm = require( 'lib/mixins/protect-form' ),
	TinyMCE = require( 'components/tinymce' ),
	EditorWordCount = require( 'post-editor/editor-word-count' ),
	SegmentedControl = require( 'components/segmented-control' ),
	SegmentedControlItem = require( 'components/segmented-control/item' ),
	EditorMobileNavigation = require( 'post-editor/editor-mobile-navigation' ),
	layoutFocus = require( 'lib/layout-focus' ),
	titleActions = require( 'lib/screen-title/actions' ),
	user = require( 'lib/user' )(),
	observe = require( 'lib/mixins/data-observe' ),
	DraftList = require( 'my-sites/drafts/draft-list' ),
	DraftsButton = require( 'post-editor/drafts-button' ),
	PostCountsData = require( 'components/data/post-counts-data' ),
	PreferencesActions = require( 'lib/preferences/actions' ),
	InvalidURLDialog = require( 'post-editor/invalid-url-dialog' ),
	RestorePostDialog = require( 'post-editor/restore-post-dialog' ),
	utils = require( 'lib/posts/utils' ),
	i18n = require( 'lib/mixins/i18n' ),
	EditorPreview = require( './editor-preview' ),
	stats = require( 'lib/posts/stats' ),
	analytics = require( 'analytics' ),
	postTypesList = require( 'lib/post-types-list')();

var messages = {
	post: {
		publishFailure: function() {
			return i18n.translate( 'Publishing of post failed.' );
		},
		editTitle: function() {
			return i18n.translate( 'Edit Post', { textOnly: true } );
		},
		published: function() {
			var site = this.props.sites.getSelectedSite();

			if ( ! site ) {
				return i18n.translate( 'Post published!' );
			}

			return i18n.translate( 'Post published on {{siteLink/}}!', {
				components: {
					siteLink: <a href={ site.URL } target="_blank">{ site.title }</a>
				},
				comment: 'Editor: Message displayed when a post is published, with a link to the site it was published on.'
			} );
		},
		publishedPrivately: function() {
			var site = this.props.sites.getSelectedSite();

			if ( ! site ) {
				return i18n.translate( 'Post privately published!' );
			}

			return i18n.translate( 'Post privately published on {{siteLink/}}!', {
				components: {
					siteLink: <a href={ site.URL } target="_blank">{ site.title }</a>
				},
				comment: 'Editor: Message displayed when a post is published privately, with a link to the site it was published on.'
			} );
		},
		view: function() {
			return i18n.translate( 'View Post' );
		},
		allPosts: function() {
			return i18n.translate( 'All Posts' );
		},
		updated: function() {
			var site = this.props.sites.getSelectedSite();

			if ( ! site ) {
				return i18n.translate( 'Post updated!' );
			}

			return i18n.translate( 'Post updated on {{siteLink/}}!', {
				components: {
					siteLink: <a href={ site.URL } target="_blank">{ site.title }</a>
				},
				comment: 'Editor: Message displayed when a post is updated, with a link to the site it was updated on.'
			} );
		}
	},
	page: {
		publishFailure: function() {
			return i18n.translate( 'Publishing of page failed.' );
		},
		editTitle: function() {
			return i18n.translate( 'Edit Page', { textOnly: true } );
		},
		published: function() {
			var site = this.props.sites.getSelectedSite();

			if ( ! site ) {
				return i18n.translate( 'Page published!' );
			}

			return i18n.translate( 'Page published on {{siteLink/}}!', {
				components: {
					siteLink: <a href={ site.URL } target="_blank">{ site.title }</a>
				},
				comment: 'Editor: Message displayed when a page is published, with a link to the site it was published on.'
			} );
		},
		publishedPrivately: function() {
			var site = this.props.sites.getSelectedSite();

			if ( ! site ) {
				return i18n.translate( 'Page privately published!' );
			}

			return i18n.translate( 'Page privately published on {{siteLink/}}!', {
				components: {
					siteLink: <a href={ site.URL } target="_blank">{ site.title }</a>
				},
				comment: 'Editor: Message displayed when a page is published privately, with a link to the site it was published on.'
			} );
		},
		view: function() {
			return i18n.translate( 'View Page' );
		},
		allPosts: function() {
			return i18n.translate( 'All Pages' );
		},
		updated: function() {
			var site = this.props.sites.getSelectedSite();

			if ( ! site ) {
				return i18n.translate( 'Page updated!' );
			}

			return i18n.translate( 'Page updated on {{siteLink/}}!', {
				components: {
					siteLink: <a href={ site.URL } target="_blank">{ site.title }</a>
				},
				comment: 'Editor: Message displayed when a page is updated, with a link to the site it was updated on.'
			} );
		}
	}
};

var PostEditor = React.createClass( {
	propTypes: {
		preferences: React.PropTypes.object,
		sites: React.PropTypes.object
	},

	_previewWindow: null,

	mixins: [
		protectForm.mixin,
		observe( 'sites' )
	],

	getInitialState: function() {
		var state = this.getPostEditState();

		return assign( {}, state, {
			isSaving: false,
			isPublishing: false,
			notice: false,
			showDrafts: false,
			showAutosaveDialog: true,
			isLoadingAutosave: false,
			isTitleFocused: false
		} );
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
		this.debouncedAutosave = debounce( throttle( this.autosave, 20000 ), 3000 );
		this.recordedDefaultEditorMode = false;
	},

	componentDidMount: function() {
		debug( 'PostEditor react component mounted.' );
		// if content is passed in, e.g., through url param
		if ( this.state.post && this.state.post.content ) {
			this.refs.editor.setEditorContent( this.state.post.content );
		}
	},

	componentWillUnmount: function() {
		PostEditStore.removeListener( 'change', this.onEditedPostChange );
		actions.stopEditing();
		this.debouncedAutosave.cancel();
		this.debouncedSaveRawContent.cancel();
		this._previewWindow = null;
		clearTimeout( this._switchEditorTimeout );
	},

	renderNotice: function() {
		var arrowLink;

		if ( ! this.state.notice || ! this.state.notice.text ) {
			return;
		}

		if ( this.state.notice.link ) {
			arrowLink = (
				<NoticeAction href={ this.state.notice.link } external={ true }>
					{ this.state.notice.action }
				</NoticeAction>
			);
		}

		return (
			<Notice
				status={ 'is-' + this.state.notice.type }
				showDismiss={ this.state.notice.type === 'success' ? false : true }
				onDismissClick={ this.onNoticeClick }
				className="post-editor__notice"
				text={ this.state.notice.text }>
				{ arrowLink }
			</Notice>
		);
	},

	toggleSidebar: function() {
		layoutFocus.set( 'content' );
	},

	toggleDrafts: function() {
		this.setState( { showDrafts: ! this.state.showDrafts } );
	},

	render: function() {
		var site = this.props.sites.getSelectedSite() || undefined,
			mode = this.getEditorMode(),
			isInvalidURL = this.state.loadingError,
			isPage,
			isTrashed,
			hasAutosave,
			headerClass;

		if ( this.state.post ) {
			isPage = utils.isPage( this.state.post );
			isTrashed = this.state.post.status === 'trash';
			hasAutosave = ( this.state.post.meta && this.state.post.meta.data && this.state.post.meta.data.autosave );
		}

		headerClass = classnames( 'editor__header', {
			'is-pinned': this.state.pinned
		} );

		return (
			<div className="post-editor">
				<div className="post-editor__inner">
					<div className="post-editor__sidebar">
						<div className="post-editor__sidebar-header">
							{ this.state.showDrafts ?
								<button className="post-editor__close" onClick={ this.toggleDrafts } aria-label={ this.translate( 'Close drafts list' ) }>
									<Gridicon icon="cross" size={ 18 } />
									<span>{ this.translate( 'Close' ) }</span>
								</button>
							:
								<a className="post-editor__close" href={ this.getAllPostsUrl() } aria-label={ this.translate( 'View list of posts' ) }>
									<Gridicon icon="arrow-left" size={ 18 } />
									<span>{ this.getMessage( 'allPosts' ) }</span>
								</a>
							}
							{ this.props.type === 'post' && site ?
								<PostCountsData siteId={ site.ID } status="draft">
									<DraftsButton onClick={ this.toggleDrafts } site={ site } />
								</PostCountsData>
							: null }
							<button onClick={ this.toggleSidebar } className="button post-editor__toggle-sidebar">
								<span>{ this.translate( 'Write' ) }</span>
							</button>
						</div>
						{ this.state.showDrafts ?
							<DraftList { ...this.props }
								onTitleClick={ this.toggleSidebar }
								showAllActionsMenu={ false }
								siteID={ site ? site.ID : null }
								selectedId={ this.state.post && this.state.post.ID || null }
							/>
						: <div>
							<EditorGroundControl
								savedPost={ this.state.savedPost }
								post={ this.state.post }
								isNew={ this.state.isNew }
								isDirty={ this.state.isDirty }
								isSaveBlocked={ this.state.isSaveBlocked }
								hasContent={ this.state.hasContent }
								isSaving={ this.state.isSaving }
								isPublishing={ this.state.isPublishing }
								onSave={ this.onSave }
								onPreview={ this.onPreview }
								onPublish={ this.onPublish }
								onTrashingPost={ this.onTrashingPost }
								site={ site }
								type={ this.props.type }
							/>
							<EditorDrawer
								type={ this.props.type }
								site={ site }
								post={ this.state.post }
								postTypes={ postTypesList }
								isNew={ this.state.isNew }
							/>

						</div> }
					</div>
					<div className="post-editor__content">
						<EditorMobileNavigation site={ site } onClose={ this.onClose } />
						<div className="editor">
							<EditorActionBar
								isNew={ this.state.isNew }
								onTrashingPost={ this.onTrashingPost }
								onPrivatePublish={ this.onPublish }
								post={ this.state.post }
								savedPost={ this.state.savedPost }
								site={ site }
								type={ this.props.type }
							/>
							<div className={ headerClass }>
								{ this.renderNotice() }
								<FeaturedImage
									site={ site }
									post={ this.state.post }
									maxWidth={ 1462 } />
								<EditorTitleContainer
									onChange={ this.debouncedAutosave }
									tabIndex={ 1 } />
								{ this.state.post && isPage ?
									<EditorPageSlug
										slug={ this.state.post.slug }
										path={ site.URL + '/' }
									/> :
									null
								}
								<SegmentedControl className="editor__switch-mode" compact={ true }>
									<SegmentedControlItem selected={ mode === 'tinymce' } onClick={ this.switchEditorMode.bind( this, 'tinymce' ) }>
										{ this.translate( 'Visual', { context: 'Editor writing mode' } ) }
									</SegmentedControlItem>
									<SegmentedControlItem selected={ mode === 'html' } onClick={ this.switchEditorMode.bind( this, 'html' ) }>
										HTML
									</SegmentedControlItem>
								</SegmentedControl>
							</div>
							<TinyMCE
								ref="editor"
								mode={ mode }
								tabIndex={ 2 }
								isNew={ this.state.isNew }
								onSetContent={ this.debouncedSaveRawContent }
								onChange={ this.onEditorContentChange }
								onKeyUp={ this.debouncedSaveRawContent }
								onFocus={ this.onEditorFocus }
								onTextEditorChange={ this.onEditorContentChange }
								onTogglePin={ this.onTogglePin } />
						</div>
						<div className="post-editor__word-count-wrapper">
							<EditorWordCount />
						</div>
						{ this.iframePreviewEnabled() ?
							<EditorPreview
								showPreview={ this.state.showPreview }
								onClose={ this.onPreviewClose }
								isSaving={ this.state.isSaving || this.state.isAutosaving }
								isLoading={ this.state.isLoading }
								previewUrl={ this.state.previewUrl }

							/>
						: null }
					</div>
				</div>
				{ isTrashed ?
					<RestorePostDialog
						post={ this.state.post }
						onClose={ this.onClose }
						onRestore={ this.onSaveTrashed }
					/>
				: null }
				{ isInvalidURL ?
					<InvalidURLDialog
						post={ this.state.post }
						onClose={ this.onClose }
					/>
				: null }
				{ hasAutosave && this.state.showAutosaveDialog ?
					<RestorePostDialog
						post={ this.state.post }
						onRestore={ this.restoreAutosave }
						onClose={ this.closeAutosaveDialog }
						isAutosave={ true }
					/>
				: null }
			</div>
		);
	},

	restoreAutosave: function() {
		var edits,
			autosave = this.state.post.meta.data.autosave;

		this.setState( { showAutosaveDialog: false, isLoadingAutosave: true } );

		edits = {
			title: autosave.title,
			excerpt: autosave.excerpt,
			content: autosave.content
		};

		actions.edit( edits );
	},

	closeAutosaveDialog: function() {
		this.setState( { showAutosaveDialog: false } );
	},

	getMessage: function( name ) {
		var type = this.props.type === 'page' ? 'page' : 'post';
		return typeof messages[ type ][ name ] === 'function' ? messages[ type ][ name ].apply( this ) : null;
	},

	onNoticeClick: function( event ) {
		event.preventDefault();
		this.setState( { notice: false } );
	},

	onTogglePin: function( state ) {
		this.setState( {
			pinned: state === 'pin'
		} );
	},

	onEditedPostChange: function() {
		var didLoad = this.state.isLoading && ! PostEditStore.isLoading(),
			loadingError = PostEditStore.getLoadingError(),
			postEditState, post, site;

		if ( loadingError ) {
			this.setState( { loadingError } );
		} else if ( ( PostEditStore.isNew() && ! this.state.isNew ) || PostEditStore.isLoading() ) {
			// is new or loading
			this.setState( this.getInitialState(), function() {
				this.refs.editor.setEditorContent( '' );
			} );
		} else {
			postEditState = this.getPostEditState();
			post = postEditState.post;
			site = post ? this.props.sites.getSite( post.site_ID ) : false;
			if ( didLoad && site && ( this.props.type === 'page' ) !== utils.isPage( post ) ) {
				// incorrect post type in URL
				page.redirect( utils.getEditURL( post, site ) );
			}
			this.setState( postEditState, function() {
				if ( didLoad || this.state.isLoadingAutosave ) {
					this.refs.editor.setEditorContent( this.state.post.content );
				}

				if ( this.state.isLoadingAutosave ) {
					this.setState( { isLoadingAutosave: false } );
				}
			} );
		}
		if ( PostEditStore.isDirty() ) {
			this.markChanged();
		} else {
			this.markSaved();
		}
	},

	onEditorContentChange: function() {
		debug( 'editor content changed' );
		this.debouncedSaveRawContent();
		this.debouncedAutosave();
	},

	onEditorFocus: function() {
		// Fire a click when the editor is focused so that any global handlers have an opportunity to do their thing.
		// In particular, this ensures that open popovers are closed when a user clicks into the editor.
		ReactDom.findDOMNode( this.refs.editor ).click();
	},

	saveRawContent: function() {
		actions.editRawContent( this.refs.editor.getContent( { format: 'raw' } ) );
	},

	autosave: function() {
		var callback;

		if ( this.state.isSaving === true || this.state.isSaveBlocked ) {
			return;
		}

		this.saveRawContent();
		actions.edit( { content: this.refs.editor.getContent() } );

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

		actions.autosave( callback );
	},

	onClose: function() {
		page( this.getAllPostsUrl() );
	},

	getAllPostsUrl: function() {
		var type = this.props.type,
			path = type === 'page' ? '/pages' : '/posts',
			site = this.props.sites.getSelectedSite();

		if ( type === 'post' && site && ! site.jetpack && ! site.single_user_site ) {
			path += '/my';
		}

		if ( site ) {
			path = route.addSiteFragment( path, site.slug );
		}

		return path;
	},

	onTrashingPost: function() {
		var isPage = utils.isPage( this.state.post );
		stats.recordStat( isPage ? 'page_trashed' : 'post_trashed' );
		stats.recordEvent( isPage ? 'Clicked Trash Page Button' : 'Clicked Trash Post Button' );
		this.markSaved();
		this.onClose();
	},

	onSaveTrashed: function( status, callback ) {
		this.setState( { showDrafts: false } );
		this.onSave( status, callback );
	},

	onSave: function( status, callback ) {
		var edits = {};

		if ( status ) {
			edits.status = status;
		}

		if ( ! utils.isPublished( this.state.savedPost ) &&
			( ! status && utils.isPublished( this.state.post ) || utils.isPublished( edits ) ) ) {
			return;
		}

		edits.content = this.refs.editor.getContent();

		actions.saveEdited( edits, function( error ) {
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

	onPreview: function( event ) {
		var status = 'draft',
			previewPost;

		if ( this.iframePreviewEnabled() && ! event.metaKey && ! event.ctrlKey ) {
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
				this._previewWindow.location = this.state.previewUrl;
				this._previewWindow.focus();
			} else {
				this._previewWindow = window.open( this.state.previewUrl, 'WordPress.com Post Preview' );
			}
		}.bind( this );

		if ( status === 'publish' ) {
			actions.edit( { content: this.refs.editor.getContent() } );
			actions.autosave( previewPost );
		} else {
			this.onSave( null, previewPost );
		}
	},

	iframePreviewEnabled: function() {
		var site = this.props.sites.getSelectedSite();
		return config.isEnabled( 'post-editor/iframe-preview' ) && site && ! site.jetpack;
	},

	iframePreview: function() {
		if ( this.state.isDirty ) {
			this.autosave();
			// to avoid a weird UX we clear the iframe when (auto)saving
			// so we need to delay opening it a bit to avoid flickering
			setTimeout( function() {
				this.setState( { showPreview: true }, function() {
					layoutFocus.set( 'content' );
				} );
			}.bind( this ), 150 );
		} else {
			this.setState( { showPreview: true }, function() {
				layoutFocus.set( 'content' );
			} );
		}
	},

	onPreviewClose: function() {
		this.setState( { showPreview: false } );
	},

	getFailureMessage: function( error ) {
		var message;

		switch ( error.message ) {
			case 'NO_CONTENT':
				message = this.translate( 'You haven\'t written anything yet!' );
				break;
		}

		return message;
	},

	onSaveDraftFailure: function( error ) {
		var message = this.getFailureMessage( error ) || this.translate( 'Saving of draft failed.' );
		this.onSaveFailure( message );
	},

	onSaveDraftSuccess: function() {
		if ( this.state.post.status === 'publish' || this.state.post.status === 'private' ) {
			this.onSaveSuccess(
				this.getMessage( 'updated' ),
				this.getMessage( 'view' ),
				this.state.post.URL
			);
		} else {
			this.onSaveSuccess();
		}
	},

	onPublish: function() {
		var currentUser = user.get(),
			edits = {
				status: 'publish'
			};

		// determine if this is a private publish
		if ( this.state.post && this.state.post.status === 'private' ) {
			edits.status = 'private';
		}

		// Update content on demand to avoid unnecessary lag and because it is expensive
		// to serialize when TinyMCE is the active mode
		edits.content = this.refs.editor.getContent();

		actions.saveEdited( edits, function( error ) {
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
		var message = this.getFailureMessage( error ) || this.getMessage( 'publishFailure' );
		this.onSaveFailure( message );
		this.toggleSidebar();
	},

	onPublishSuccess: function() {
		const publishedMessage = 'private' === utils.getVisibility( this.state.savedPost ) ?
			this.getMessage( 'publishedPrivately' ) :
			this.getMessage( 'published' );

		this.onSaveSuccess(
			publishedMessage,
			this.getMessage( 'view' ),
			this.state.post.URL
		);

		this.toggleSidebar();
	},

	onSaveFailure: function( message ) {
		this.setState( {
			isSaving: false,
			isPublishing: false,
			notice: {
				type: 'error',
				text: message
			}
		} );

		window.scrollTo( 0, 0 );
	},

	onSaveSuccess: function( message, action, link ) {
		var post = PostEditStore.get(),
			basePath, nextState;

		if ( utils.isPage( post ) ) {
			basePath = '/page';
		} else {
			basePath = '/post';
		}

		// make sure the history entry has the post ID in it, but don't dispatch
		page.replace(
			basePath + '/' + this.props.sites.getSite( post.site_ID ).slug + '/' + post.ID,
			null, false, false
		);
		titleActions.setTitle( this.getMessage( 'editTitle' ), { siteID: this.props.sites.selected } );

		nextState = {
			isSaving: false,
			isPublishing: false
		};

		if ( message ) {
			nextState.notice = {
				type: 'success',
				text: message,
				action: action,
				link: link || null
			};

			window.scrollTo( 0, 0 );
		} else {
			nextState.notice = null;
		}

		this.setState( nextState );
	},

	getEditorMode: function() {
		var editorMode = 'tinymce'
		if ( this.props.preferences ) {
			if ( this.props.preferences[ 'editor-mode' ] ) {
				editorMode = this.props.preferences[ 'editor-mode' ];
			}

			if ( ! this.recordedDefaultEditorMode ) {
				analytics.mc.bumpStat( 'calypso_default_editor_mode', editorMode );
				this.recordedDefaultEditorMode = true;
			}
		}

		return editorMode;
	},

	switchEditorMode: function( mode ) {
		var content = this.refs.editor.getContent();

		if ( mode === 'html' ) {
			this.refs.editor.setEditorContent( content );
		}

		PreferencesActions.set( 'editor-mode', mode );

		// Defer actions until next available tick to avoid
		// dispatching inside a dispatch which can happen if for example the
		// title field is focused when toggling the editor.
		this._switchEditorTimeout = setTimeout( function() {
			actions.edit( { content: content } );
			actions.resetRawContent();

			if ( mode === 'html' ) {
				// Set raw content directly to avoid race conditions
				actions.editRawContent( content );
			} else {
				this.saveRawContent();
			}
		}.bind( this ), 0 );
	}

} );

module.exports = PostEditor;
