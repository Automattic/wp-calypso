/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { endsWith, map, partial, pickBy, startsWith, isArray, flowRight, difference } from 'lodash';
/* eslint-disable no-restricted-imports */
import url from 'url';
import { localize, LocalizeProps } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import EditorMediaModal from 'post-editor/editor-media-modal';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import {
	getCustomizerUrl,
	getSiteOption,
	getSiteAdminUrl,
	isRequestingSites,
	isRequestingSite,
	isJetpackSite,
	getSite,
} from 'state/sites/selectors';
import { addQueryArgs } from 'lib/route';
import { getEnabledFilters, getDisabledDataSources, mediaCalypsoToGutenberg } from './media-utils';
import { replaceHistory, navigate } from 'state/ui/actions';
import { clearLastNonEditorRoute, setRoute } from 'state/route/actions';
import { updateSiteFrontPage } from 'state/sites/actions';
import getCurrentRoute from 'state/selectors/get-current-route';
import getPostTypeTrashUrl from 'state/selectors/get-post-type-trash-url';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import getEditorCloseConfig from 'state/selectors/get-editor-close-config';
import getMedia from 'state/selectors/get-media';
import wpcom from 'lib/wp';
import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';
import { openPostRevisionsDialog } from 'state/posts/revisions/actions';
import { setEditorIframeLoaded, startEditingPost } from 'state/editor/actions';
import { notifyDesktopViewPostClicked, notifyDesktopCannotOpenEditor } from 'state/desktop/actions';
import { Placeholder } from './placeholder';
import WebPreview from 'components/web-preview';
import { editPost, trashPost } from 'state/posts/actions';
import { getEditorPostId } from 'state/editor/selectors';
import { protectForm, ProtectedFormProps } from 'lib/protect-form';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import config from 'config';
import EditorDocumentHead from 'post-editor/editor-document-head';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { withStopPerformanceTrackingProp, PerformanceTrackProps } from 'lib/performance-tracking';
import { REASON_BLOCK_EDITOR_UNKOWN_IFRAME_LOAD_FAILURE } from 'state/desktop/window-events';
import inEditorDeprecationGroup from 'state/editor-deprecation-group/selectors/in-editor-deprecation-group';
import { setMediaLibrarySelectedItems } from 'state/media/actions';
import { fetchMediaItem, getMediaItem } from 'state/media/thunks';

/**
 * Types
 */
import * as T from 'types';

/**
 * Style dependencies
 */
import './style.scss';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
	duplicatePostId: T.PostId;
	postId: T.PostId;
	postType: T.PostType;
	editorType: 'site' | 'post'; // Note: a page or other CPT is a type of post.
	pressThis: any;
	siteAdminUrl: T.URL | null;
	fseParentPageId: T.PostId;
	parentPostId: T.PostId;
	stripeConnectSuccess: 'gutenberg' | null;
}

interface State {
	allowedTypes?: any;
	classicBlockEditorId?: any;
	editedPost?: any;
	gallery?: any;
	isIframeLoaded: boolean;
	currentIFrameUrl: string;
	isMediaModalVisible: boolean;
	isPreviewVisible: boolean;
	multiple?: any;
	postUrl?: T.URL;
	previewUrl: T.URL;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

enum WindowActions {
	Loaded = 'loaded',
	ClassicBlockOpenMediaModel = 'classicBlockOpenMediaModal',
}

enum EditorActions {
	GoToAllPosts = 'goToAllPosts', // Unused action in favor of CloseEditor. Maintained here to support cached scripts.
	CloseEditor = 'closeEditor',
	OpenMediaModal = 'openMediaModal',
	OpenRevisions = 'openRevisions',
	PostStatusChange = 'postStatusChange',
	PreviewPost = 'previewPost',
	ViewPost = 'viewPost',
	SetDraftId = 'draftIdSet',
	TrashPost = 'trashPost',
	OpenCustomizer = 'openCustomizer',
	GetTemplateEditorUrl = 'getTemplateEditorUrl',
	OpenTemplatePart = 'openTemplatePart',
	GetCloseButtonUrl = 'getCloseButtonUrl',
	LogError = 'logError',
	GetGutenboardingStatus = 'getGutenboardingStatus',
	GetNavSidebarLabels = 'getNavSidebarLabels',
	GetCalypsoUrlInfo = 'getCalypsoUrlInfo',
	TrackPerformance = 'trackPerformance',
}

class CalypsoifyIframe extends Component<
	Props & ConnectedProps & ProtectedFormProps & LocalizeProps & PerformanceTrackProps,
	State
> {
	state: State = {
		isMediaModalVisible: false,
		isIframeLoaded: false,
		isPreviewVisible: false,
		previewUrl: 'about:blank',
		currentIFrameUrl: '',
	};

	iframeRef: React.RefObject< HTMLIFrameElement > = React.createRef();
	iframePort: MessagePort | null = null;
	mediaSelectPort: MessagePort | null = null;
	mediaCancelPort: MessagePort | null = null;
	revisionsPort: MessagePort | null = null;
	successfulIframeLoad = false;
	waitForIframeToInit: ReturnType< typeof setInterval > | undefined = undefined;
	waitForIframeToLoad: ReturnType< typeof setTimeout > | undefined = undefined;

	componentDidMount() {
		window.addEventListener( 'message', this.onMessage, false );

		const isDesktop = config.isEnabled( 'desktop' );
		// If the iframe fails to load for some reson, eg. an unexpected auth loop, this timeout
		// provides a redirect to wpadmin for web users - this should now be a rare occurance with
		// a 3rd party cookie auth issue fix in place https://github.com/Automattic/jetpack/pull/16167
		this.waitForIframeToInit = setInterval( () => {
			if ( this.props.shouldLoadIframe ) {
				clearInterval( this.waitForIframeToInit );
				this.waitForIframeToLoad = setTimeout( () => {
					isDesktop
						? this.props.notifyDesktopCannotOpenEditor(
								this.props.site,
								REASON_BLOCK_EDITOR_UNKOWN_IFRAME_LOAD_FAILURE,
								this.props.iframeUrl
						  )
						: window.location.replace( this.props.iframeUrl );
				}, 25000 );
			}
		}, 1000 );

		// An earlier page with no access to the Calypso store (probably `/new`) has asked
		// for the `lastNonEditorRoute` state to be cleared so that `getEditorCloseConfig()`
		// will return the default close location.
		if ( window.sessionStorage.getItem( 'a8c-clearLastNonEditorRoute' ) ) {
			window.sessionStorage.removeItem( 'a8c-clearLastNonEditorRoute' );
			this.props.clearLastNonEditorRoute();
		}
	}

	componentDidUpdate( prevProps ) {
		const previousMedia = prevProps.media;
		const currentMedia = this.props.media;

		if ( previousMedia !== currentMedia ) {
			const diff = difference( previousMedia, currentMedia );
			diff.forEach( ( mediaItem ) => {
				const status =
					currentMedia.find( ( item ) => item.ID === mediaItem.ID ) !== undefined
						? 'updated'
						: 'removed';

				this.updateImageBlocks( mediaItem, status );
			} );
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.onMessage, false );
	}

	onMessage = ( { data, origin }: MessageEvent ) => {
		if ( ! data || 'gutenbergIframeMessage' !== data.type ) {
			return;
		}

		const isValidOrigin =
			this.props.siteAdminUrl && this.props.siteAdminUrl.indexOf( origin ) === 0;

		if ( ! isValidOrigin ) {
			return;
		}

		const { action } = data;

		if (
			WindowActions.Loaded === action &&
			this.iframeRef.current &&
			this.iframeRef.current.contentWindow
		) {
			this.successfulIframeLoad = true;
			const { port1: iframePortObject, port2: transferredPortObject } = new window.MessageChannel();

			this.iframePort = iframePortObject;
			this.iframePort.addEventListener( 'message', this.onIframePortMessage, false );
			this.iframePort.start();

			this.iframeRef.current.contentWindow.postMessage( { action: 'initPort' }, '*', [
				transferredPortObject,
			] );

			// Check if we're generating a post via Press This
			this.pressThis();

			// Notify external listeners that the iframe has loaded
			this.props.setEditorIframeLoaded();

			return;
		}

		// this message comes from inside TinyMCE and therefore
		// cannot be controlled like the others
		if ( WindowActions.ClassicBlockOpenMediaModel === action ) {
			if ( data.imageId ) {
				const { siteId } = this.props;
				this.props.setMediaLibrarySelectedItems( siteId, [ { ID: data.imageId } ] );
			}

			this.setState( {
				classicBlockEditorId: data.editorId,
				isMediaModalVisible: true,
				multiple: true,
			} );
		}

		// any other message is unknown and may indicate a bug
	};

	onIframePortMessage = ( event: MessageEvent ) => {
		const { data, ports: backCompatPorts } = event;

		// in a previous release of wpcom-block-editor, ports array wasn't explicitly passed into the data object
		// and the MessageEvent.ports prop was used instead. This gives support for both versions of wpcom-block-editor
		// see: https://github.com/Automattic/wp-calypso/pull/45436
		const ports = data.ports ?? backCompatPorts;

		/* eslint-disable @typescript-eslint/no-explicit-any */
		const { action, payload }: { action: EditorActions; payload: any } = data;

		if ( EditorActions.OpenMediaModal === action && ports && ports[ 0 ] ) {
			const { siteId } = this.props;
			const { allowedTypes, gallery, multiple, value } = payload;

			// set imperatively on the instance because this is not
			// the kind of assignment which causes re-renders and we
			// want it set immediately
			this.mediaSelectPort = ports[ 0 ];
			this.mediaCancelPort = ports[ 1 ];

			if ( value ) {
				const ids = Array.isArray( value )
					? value.map( ( item ) => parseInt( item, 10 ) )
					: [ parseInt( value, 10 ) ];
				const selectedItems = ids.map( ( id ) => {
					const media = this.props.getMediaItem( siteId, id );
					if ( ! media ) {
						this.props.fetchMediaItem( siteId, id );
					}
					return {
						ID: id,
						...media,
					};
				} );

				this.props.setMediaLibrarySelectedItems( siteId, selectedItems );
			} else {
				this.props.setMediaLibrarySelectedItems( siteId, [] );
			}

			this.setState( { isMediaModalVisible: true, allowedTypes, gallery, multiple } );
		}

		if ( EditorActions.SetDraftId === action && ! this.props.postId ) {
			const { postId } = payload;
			const { siteId, currentRoute, postType } = this.props;

			if ( ! endsWith( currentRoute, `/${ postId }` ) ) {
				this.props.replaceHistory( `${ currentRoute }/${ postId }`, true );
				this.props.setRoute( `${ currentRoute }/${ postId }` );

				//set postId on state.editor.postId, so components like editor revisions can read from it
				this.props.startEditingPost( siteId, postId );

				//set post type on state.posts.[ id ].type, so components like document head can read from it
				this.props.editPost( siteId, postId, { type: postType } );
			}
		}

		if ( EditorActions.TrashPost === action ) {
			const { siteId, editedPostId, postTypeTrashUrl } = this.props;
			this.props.trashPost( siteId, editedPostId );
			this.props.navigate( postTypeTrashUrl );
		}

		if ( EditorActions.CloseEditor === action || EditorActions.GoToAllPosts === action ) {
			const { unsavedChanges = false } = payload;
			this.props.setEditorIframeLoaded( false );
			this.navigate( this.props.closeUrl, unsavedChanges );
		}

		if ( EditorActions.OpenRevisions === action ) {
			if ( ports && ports[ 0 ] ) {
				// set imperatively on the instance because this is not
				// the kind of assignment which causes re-renders and we
				// want it set immediately
				this.revisionsPort = ports[ 0 ];
			}

			this.props.openPostRevisionsDialog();
		}

		if ( EditorActions.PreviewPost === action ) {
			const { postUrl } = payload;
			this.openPreviewModal( postUrl, ports[ 0 ] );
		}

		if ( EditorActions.ViewPost === action ) {
			const { postUrl } = payload;
			config.isEnabled( 'desktop' )
				? this.props.notifyDesktopViewPostClicked( postUrl )
				: window.open( postUrl, '_top' );
		}

		if ( EditorActions.OpenCustomizer === action ) {
			const { autofocus = null, unsavedChanges = false } = payload;
			this.openCustomizer( autofocus, unsavedChanges );
		}

		if ( EditorActions.OpenTemplatePart === action ) {
			const { templatePartId, unsavedChanges } = payload;
			const templatePartUrl = this.getTemplateEditorUrl( templatePartId );
			this.navigate( templatePartUrl, unsavedChanges );
		}

		if ( EditorActions.GetCloseButtonUrl === action ) {
			const { closeUrl, closeLabel } = this.props;
			ports[ 0 ].postMessage( {
				closeUrl: `${ window.location.origin }${ closeUrl }`,
				label: closeLabel,
			} );
		}

		if ( EditorActions.GetGutenboardingStatus === action ) {
			const isGutenboarding =
				this.props.siteCreationFlow === 'gutenboarding' && this.props.isSiteUnlaunched;
			const frankenflowUrl = `${ window.location.origin }/start/new-launch?siteSlug=${ this.props.siteSlug }&source=editor`;
			const isNewLaunch = config.isEnabled( 'gutenboarding/new-launch' );
			const isExperimental = config.isEnabled( 'gutenboarding/feature-picker' );

			ports[ 0 ].postMessage( {
				isGutenboarding,
				frankenflowUrl,
				isNewLaunch,
				isExperimental,
			} );
		}

		if ( EditorActions.GetNavSidebarLabels === action ) {
			const { translate } = this.props;

			ports[ 0 ].postMessage( {
				allPostsLabels: {
					page: translate( 'View all pages' ),
					post: translate( 'View all posts' ),
				},
				createPostLabels: {
					page: translate( 'Add new page' ),
					post: translate( 'Add new post' ),
				},
				listHeadings: {
					page: translate( 'Recent Pages' ),
					post: translate( 'Recent Posts' ),
				},
			} );
		}

		if ( EditorActions.GetCalypsoUrlInfo === action ) {
			ports[ 0 ].postMessage( {
				origin: window.location.origin,
				siteSlug: this.props.siteSlug,
			} );
		}

		// Pipes errors in the iFrame context to the Calypso error handler if it exists:
		if ( EditorActions.LogError === action ) {
			const { error } = payload;
			if ( isArray( error ) && error.length > 4 && window.onerror ) {
				const errorObject = error[ 4 ];
				error[ 4 ] = errorObject && JSON.parse( errorObject );
				window.onerror( ...error );
			}
		}

		if ( EditorActions.PostStatusChange === action ) {
			const { status } = payload;
			this.handlePostStatusChange( status );
		}

		if ( EditorActions.TrackPerformance === action ) {
			if ( payload.mark === 'editor.ready' ) {
				this.props.stopPerformanceTracking( {
					isNew: payload.isNew,
					blockCount: payload.blockCount,
				} );
			}
		}
	};

	handlePostStatusChange = ( status: string ) => {
		if ( this.props.creatingNewHomepage && 'publish' === status ) {
			this.setFrontPage();
		}
	};

	setFrontPage = () => {
		const { editedPostId, siteId } = this.props;
		this.props.updateSiteFrontPage( siteId, {
			show_on_front: 'page',
			page_on_front: editedPostId,
		} );
	};

	loadRevision = ( {
		post_title: title,
		post_excerpt: excerpt,
		post_content: content,
	}: {
		post_title: string;
		post_excerpt: string;
		post_content: string;
	} ) => {
		if ( ! this.iframePort ) {
			return;
		}

		if ( this.revisionsPort ) {
			this.revisionsPort.postMessage( { title, excerpt, content } );

			// this is a once-only port
			// after sending our message we want to close it out
			// and prevent sending more messages (which will be ignored)
			this.revisionsPort.close();
			this.revisionsPort = null;
		} else {
			// this to be removed once we are reliably
			// sending the new MessageChannel from the server
			this.iframePort.postMessage( {
				action: 'loadRevision',
				payload: { title, excerpt, content },
			} );
		}
	};

	closeMediaModal = ( media: { items: Parameters< typeof mediaCalypsoToGutenberg >[] } ) => {
		if ( ! this.state.classicBlockEditorId && media && this.mediaSelectPort ) {
			const { multiple } = this.state;
			const formattedMedia = map( media.items, ( item ) => mediaCalypsoToGutenberg( item ) );
			const payload = multiple ? formattedMedia : formattedMedia[ 0 ];

			this.mediaSelectPort.postMessage( payload );

			// this is a once-only port
			// after sending our message we want to close it out
			// and prevent sending more messages (which will be ignored)
			this.mediaSelectPort.close();
			this.mediaSelectPort = null;
		}

		if ( ! this.state.classicBlockEditorId && ! media && this.mediaCancelPort ) {
			this.mediaCancelPort.postMessage( true );
			this.mediaCancelPort.close();
			this.mediaCancelPort = null;
		}

		this.setState( { classicBlockEditorId: null, isMediaModalVisible: false } );
	};

	insertClassicBlockMedia = ( markup: string ) => {
		if ( ! ( this.state.classicBlockEditorId && this.iframePort ) ) {
			return;
		}

		this.iframePort.postMessage( {
			action: 'insertClassicBlockMedia',
			payload: {
				editorId: this.state.classicBlockEditorId,
				media: markup,
			},
		} );
	};

	pressThis = () => {
		const { pressThis } = this.props;

		if ( ! ( pressThis && this.iframePort ) ) {
			return;
		}

		this.iframePort.postMessage( {
			action: 'pressThis',
			payload: pressThis,
		} );
	};

	updateImageBlocks = ( mediaItem, status ) => {
		if (
			! this.iframePort ||
			! startsWith( mediaItem.mime_type, 'image/' ) ||
			startsWith( mediaItem.URL, 'blob:' )
		) {
			return;
		}
		const payload = {
			id: mediaItem?.ID,
			transientId: mediaItem?.ID,
			height: mediaItem?.height,
			width: mediaItem?.width,
			url: mediaItem?.URL,
			status,
		};
		this.iframePort.postMessage( { action: 'updateImageBlocks', payload } );
	};

	openPreviewModal = ( postUrl: string, previewPort: MessagePort ) => {
		this.setState( {
			isPreviewVisible: true,
			previewUrl: 'about:blank',
			postUrl,
		} );

		previewPort.onmessage = ( message: MessageEvent ) => {
			previewPort.close();

			const { frameNonce, unmappedSiteUrl } = this.props;
			const { previewUrl, editedPost } = message.data;
			const parsedPreviewUrl = url.parse( previewUrl, true );

			if ( frameNonce ) {
				parsedPreviewUrl.query[ 'frame-nonce' ] = frameNonce;
			}

			parsedPreviewUrl.query.iframe = 'true';
			delete parsedPreviewUrl.search;

			const { host: unmappedSiteUrlHost } = url.parse( unmappedSiteUrl );
			if ( unmappedSiteUrlHost ) {
				parsedPreviewUrl.host = unmappedSiteUrlHost;
				parsedPreviewUrl.hostname = unmappedSiteUrlHost;
			}

			this.setState( {
				previewUrl: url.format( parsedPreviewUrl ),
				editedPost,
			} );
		};
	};

	closePreviewModal = () => this.setState( { isPreviewVisible: false } );

	openCustomizer = ( autofocus: object, unsavedChanges: boolean ) => {
		let { customizerUrl } = this.props;
		if ( autofocus ) {
			const [ key, value ] = Object.entries( autofocus )[ 0 ];
			customizerUrl = addQueryArgs(
				{
					[ `autofocus[${ key }]` ]: value,
				},
				customizerUrl
			);
		}
		this.navigate( customizerUrl, unsavedChanges );
	};

	getTemplateEditorUrl = ( templateId: T.PostId ) => {
		const { getTemplateEditorUrl, editedPostId } = this.props;

		let templateEditorUrl = getTemplateEditorUrl( templateId );
		if ( editedPostId ) {
			templateEditorUrl = addQueryArgs( { fse_parent_post: editedPostId }, templateEditorUrl );
		}

		return templateEditorUrl;
	};

	navigate = ( navUrl: string, unsavedChanges: boolean ) => {
		const { markChanged, markSaved } = this.props;
		unsavedChanges ? markChanged() : markSaved();
		this.props.navigate( navUrl );
	};

	getStatsPath = () => {
		const { postId } = this.props;
		return postId ? '/block-editor/:post_type/:site/:post_id' : '/block-editor/:post_type/:site';
	};

	getStatsProps = () => {
		const { postId, postType } = this.props;
		return postId ? { post_type: postType, post_id: postId } : { post_type: postType };
	};

	getStatsTitle = () => {
		const { postId, postType } = this.props;
		let postTypeText: string;

		switch ( postType ) {
			case 'post':
				postTypeText = 'Post';
				break;
			case 'page':
				postTypeText = 'Page';
				break;
			default:
				postTypeText = 'Custom Post Type';
				break;
		}

		return postId
			? `Block Editor > ${ postTypeText } > Edit`
			: `Block Editor > ${ postTypeText } > New`;
	};

	onIframeLoaded = async ( iframeUrl: string ) => {
		clearTimeout( this.waitForIframeToLoad );
		if ( ! this.successfulIframeLoad ) {
			// Sometimes (like in IE) the WindowActions.Loaded message arrives after
			// the onLoad event is fired. To deal with this case we'll poll
			// `this.successfulIframeLoad` for a while before redirecting.

			// Checks to see if the iFrame has loaded every 200ms. If it has
			// loaded, then resolve the promise.
			let pendingIsLoadedInterval;
			const pollForLoadedFlag = new Promise( ( resolve ) => {
				pendingIsLoadedInterval = setInterval(
					() => this.successfulIframeLoad && resolve( 'iframe-loaded' ),
					200
				);
			} );

			const fiveSeconds = new Promise( ( resolve ) => setTimeout( resolve, 5000, 'timeout' ) );

			const finishCondition = await Promise.race( [ pollForLoadedFlag, fiveSeconds ] );
			clearInterval( pendingIsLoadedInterval );

			if ( finishCondition === 'timeout' ) {
				window.location.replace( iframeUrl );
				return;
			}
		}
		this.setState( { isIframeLoaded: true, currentIFrameUrl: iframeUrl } );
	};

	render() {
		const { iframeUrl, shouldLoadIframe } = this.props;
		const {
			classicBlockEditorId,
			isMediaModalVisible,
			allowedTypes,
			multiple,
			isIframeLoaded,
			isPreviewVisible,
			previewUrl,
			postUrl,
			editedPost,
			currentIFrameUrl,
		} = this.state;

		const isUsingClassicBlock = !! classicBlockEditorId;

		return (
			<Fragment>
				<PageViewTracker
					path={ this.getStatsPath() }
					title={ this.getStatsTitle() }
					properties={ this.getStatsProps() }
				/>
				<EditorDocumentHead />
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<div className="main main-column calypsoify is-iframe" role="main">
					{ ! isIframeLoaded && <Placeholder /> }
					{ ( shouldLoadIframe || isIframeLoaded ) && (
						/* eslint-disable jsx-a11y/iframe-has-title */
						<iframe
							ref={ this.iframeRef }
							src={ isIframeLoaded ? currentIFrameUrl : iframeUrl }
							// Iframe url needs to be kept in state to prevent editor reloading if frame_nonce changes
							// in Jetpack sites
							onLoad={ () => {
								this.onIframeLoaded( iframeUrl );
							} }
						/>
						/* eslint-enable jsx-a11y/iframe-has-title */
					) }
				</div>
				<EditorMediaModal
					disabledDataSources={ getDisabledDataSources( allowedTypes ) }
					enabledFilters={ getEnabledFilters( allowedTypes ) }
					galleryViewEnabled={ isUsingClassicBlock }
					isGutenberg={ ! isUsingClassicBlock }
					onClose={ this.closeMediaModal }
					onInsertMedia={ this.insertClassicBlockMedia }
					single={ ! multiple }
					source=""
					visible={ isMediaModalVisible }
				/>
				<EditorRevisionsDialog loadRevision={ this.loadRevision } />
				<WebPreview
					externalUrl={ postUrl }
					onClose={ this.closePreviewModal }
					overridePost={ editedPost }
					previewUrl={ previewUrl }
					showEditHeaderLink={ true }
					showPreview={ isPreviewVisible }
				/>
			</Fragment>
		);
	}
}

const mapStateToProps = (
	state: T.AppState,
	{
		postId,
		postType,
		duplicatePostId,
		fseParentPageId,
		parentPostId,
		creatingNewHomepage,
		editorType = 'post',
		stripeConnectSuccess,
	}: Props
) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const currentRoute = getCurrentRoute( state );
	const postTypeTrashUrl = getPostTypeTrashUrl( state, postType );
	const siteOption = isJetpackSite( state, siteId ) ? 'jetpack_frame_nonce' : 'frame_nonce';

	let queryArgs = pickBy( {
		post: postId,
		action: postId && 'edit', // If postId is set, open edit view.
		post_type: postType !== 'post' && postType, // Use postType if it's different than post.
		calypsoify: 1,
		fse_parent_post: fseParentPageId != null && fseParentPageId,
		parent_post: parentPostId != null && parentPostId,
		'block-editor': 1,
		'frame-nonce': getSiteOption( state, siteId, siteOption ) || '',
		'jetpack-copy': duplicatePostId,
		origin: window.location.origin,
		'environment-id': config( 'env_id' ),
		'new-homepage': creatingNewHomepage,
		...( !! stripeConnectSuccess && { stripe_connect_success: stripeConnectSuccess } ),
	} );

	// needed for loading the editor in SU sessions
	if ( wpcom.addSupportParams ) {
		queryArgs = wpcom.addSupportParams( queryArgs );
	}

	// Pass through to iframed editor if user is in editor deprecation group.
	if ( inEditorDeprecationGroup( state ) && 'classic' === getSelectedEditor( state, siteId ) ) {
		queryArgs[ 'in-editor-deprecation-group' ] = 1;
	}

	const siteAdminUrl =
		editorType === 'site'
			? getSiteAdminUrl( state, siteId, 'admin.php?page=gutenberg-edit-site' )
			: getSiteAdminUrl( state, siteId, postId ? 'post.php' : 'post-new.php' );

	const iframeUrl = addQueryArgs( queryArgs, siteAdminUrl );

	// Prevents the iframe from loading using a cached frame nonce.
	const shouldLoadIframe = ! isRequestingSites( state ) && ! isRequestingSite( state, siteId );

	const { url: closeUrl, label: closeLabel } = getEditorCloseConfig(
		state,
		siteId,
		postType,
		fseParentPageId
	);

	return {
		closeUrl,
		closeLabel,
		currentRoute,
		editedPostId: getEditorPostId( state ),
		frameNonce: getSiteOption( state, siteId, 'frame_nonce' ) || '',
		iframeUrl,
		postTypeTrashUrl,
		shouldLoadIframe,
		siteAdminUrl,
		siteId,
		siteSlug,
		customizerUrl: getCustomizerUrl( state, siteId ),
		// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
		getTemplateEditorUrl: partial(
			getGutenbergEditorUrl,
			state,
			siteId,
			partial.placeholder,
			'wp_template_part'
		),
		unmappedSiteUrl: getSiteOption( state, siteId, 'unmapped_url' ),
		siteCreationFlow: getSiteOption( state, siteId, 'site_creation_flow' ),
		isSiteUnlaunched: isUnlaunchedSite( state, siteId ),
		site: getSite( state, siteId ),
		parentPostId,
		media: getMedia( state, siteId ),
	};
};

const mapDispatchToProps = {
	replaceHistory,
	setRoute,
	navigate,
	openPostRevisionsDialog,
	setEditorIframeLoaded,
	startEditingPost,
	notifyDesktopViewPostClicked,
	editPost,
	trashPost,
	updateSiteFrontPage,
	notifyDesktopCannotOpenEditor,
	setMediaLibrarySelectedItems,
	fetchMediaItem,
	getMediaItem,
	clearLastNonEditorRoute,
};

type ConnectedProps = ReturnType< typeof mapStateToProps > & typeof mapDispatchToProps;

export default flowRight(
	withStopPerformanceTrackingProp,
	connect( mapStateToProps, mapDispatchToProps ),
	localize,
	protectForm
)( CalypsoifyIframe );
