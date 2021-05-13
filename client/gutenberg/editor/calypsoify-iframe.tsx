/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { map, partial, pickBy, flowRight } from 'lodash';
/* eslint-disable no-restricted-imports */
import url from 'url';
import { localize, LocalizeProps } from 'i18n-calypso';
import type { RequestCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	getCustomizerUrl,
	getSiteOption,
	getSiteAdminUrl,
	isRequestingSite,
	isJetpackSite,
	getSite,
} from 'calypso/state/sites/selectors';
import { addQueryArgs } from 'calypso/lib/route';
import { getEnabledFilters, getDisabledDataSources, mediaCalypsoToGutenberg } from './media-utils';
import { replaceHistory, navigate } from 'calypso/state/ui/actions';
import { clearLastNonEditorRoute, setRoute } from 'calypso/state/route/actions';
import { updateSiteFrontPage } from 'calypso/state/sites/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPostTypeTrashUrl from 'calypso/state/selectors/get-post-type-trash-url';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import getEditorCloseConfig from 'calypso/state/selectors/get-editor-close-config';
import wpcom from 'calypso/lib/wp';
import { openPostRevisionsDialog } from 'calypso/state/posts/revisions/actions';
import { setEditorIframeLoaded, startEditingPost } from 'calypso/state/editor/actions';
import { Placeholder } from './placeholder';
import WebPreview from 'calypso/components/web-preview';
import { editPost, trashPost } from 'calypso/state/posts/actions';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { protectForm, ProtectedFormProps } from 'calypso/lib/protect-form';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import getSiteUrl from 'calypso/state/selectors/get-site-url';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import config from '@automattic/calypso-config';
import EditorDocumentHead from 'calypso/post-editor/editor-document-head';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import {
	withStopPerformanceTrackingProp,
	PerformanceTrackProps,
} from 'calypso/lib/performance-tracking';
import { selectMediaItems } from 'calypso/state/media/actions';
import { fetchMediaItem, getMediaItem } from 'calypso/state/media/thunks';
import Iframe from './iframe';

/**
 * Types
 */
import * as T from 'calypso/types';

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
	anchorFmData: {
		anchor_podcast: string | undefined;
		anchor_episode: string | undefined;
		spotify_url: string | undefined;
	};
	siteAdminUrl: T.URL | null;
	fseParentPageId: T.PostId;
	parentPostId: T.PostId;
	stripeConnectSuccess: 'gutenberg' | null;
}

interface CheckoutModalOptions extends RequestCart {
	redirectTo?: string;
	isFocusedLaunch?: boolean;
}

interface State {
	allowedTypes?: any;
	classicBlockEditorId?: any;
	editedPost?: any;
	gallery?: any;
	isIframeLoaded: boolean;
	currentIFrameUrl: string;
	isMediaModalVisible: boolean;
	isCheckoutModalVisible: boolean;
	isPreviewVisible: boolean;
	multiple?: any;
	postUrl?: T.URL;
	previewUrl: T.URL;
	checkoutModalOptions?: CheckoutModalOptions;
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
	OpenCheckoutModal = 'openCheckoutModal',
	GetCheckoutModalStatus = 'getCheckoutModalStatus',
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
	ToggleInlineHelpButton = 'toggleInlineHelpButton',
	GetNavSidebarLabels = 'getNavSidebarLabels',
	GetCalypsoUrlInfo = 'getCalypsoUrlInfo',
	TrackPerformance = 'trackPerformance',
}

type ComponentProps = Props &
	ConnectedProps &
	ProtectedFormProps &
	LocalizeProps &
	PerformanceTrackProps;

class CalypsoifyIframe extends Component< ComponentProps, State > {
	state: State = {
		isMediaModalVisible: false,
		isCheckoutModalVisible: false,
		isIframeLoaded: false,
		isPreviewVisible: false,
		previewUrl: 'about:blank',
		currentIFrameUrl: '',
		checkoutModalOptions: undefined,
	};

	iframeRef: React.RefObject< HTMLIFrameElement > = React.createRef();
	iframePort: MessagePort | null = null;
	mediaSelectPort: MessagePort | null = null;
	mediaCancelPort: MessagePort | null = null;
	revisionsPort: MessagePort | null = null;
	checkoutPort: MessagePort | null = null;

	componentDidMount() {
		window.addEventListener( 'message', this.onMessage, false );

		// Redirect timer stage 1.
		if ( this.props.shouldLoadIframe && ! this.editorRedirectTimer ) {
			this.setEditorRedirectTimer( 25000 );
		}

		// An earlier page with no access to the Calypso store (probably `/new`) has asked
		// for the `lastNonEditorRoute` state to be cleared so that `getEditorCloseConfig()`
		// will return the default close location.
		if ( window.sessionStorage.getItem( 'a8c-clearLastNonEditorRoute' ) ) {
			window.sessionStorage.removeItem( 'a8c-clearLastNonEditorRoute' );
			this.props.clearLastNonEditorRoute();
		}
	}

	componentDidUpdate( { shouldLoadIframe }: ComponentProps ) {
		// Redirect timer stage 1. Starts when shouldLoadIframe turns to true if
		// not already triggered in componentDidMount
		if ( ! this.editorRedirectTimer && ! shouldLoadIframe && this.props.shouldLoadIframe ) {
			this.setEditorRedirectTimer( 25000 );
		}
	}

	componentWillUnmount() {
		this.editorRedirectTimer && clearTimeout( this.editorRedirectTimer );
		window.removeEventListener( 'message', this.onMessage, false );
	}

	/**
	 * The editor redirect timer will attempt to perform a redirect if the editor
	 * has not loaded after a certain time. The timer is always cancelled as soon
	 * as the iframe sends us a message that the editor is ready to go via the
	 * iframe bridge server. Given that we have redirect logic in our parent
	 * components which detects things like lack of authentication, this timer
	 * handles error conditions which we cannot detect. There are two stages:
	 *
	 * 1. The first stage waits up to 25 seconds for the iframe to call `onLoad`.
	 * This is to handle rare error conditions such as redirects within the frame
	 * which cause iframe.onload to never be called. It's 25 seconds to account
	 * for slow network conditions. Thankfully, this timer should very rarely be
	 * triggered as most failure conditions happen do not happen in this stage.
	 * Most problems are detected before (such as auth) or after (such as the page
	 * loading the wrong thing).
	 *
	 * 2. The second stage waits 2 seconds to ensure the iframe is responding as
	 * we expect. After `iframe.onload` is called, we still don't know if the editor
	 * has loaded because the browser could be displaying an error message (such
	 * is the case with `X-Frame-Options: DENY`) in the document which has loaded.
	 * As a result, we need to wait to make sure the iframe bridge server
	 * is responding. It needs to be greater than 0 because we can't guarantee
	 * that the iframe will have executed the script which sends the message by
	 * the time iframe.onload is called. However, we do know that the script will
	 * at least be downloaded and parsed (because that's what iframe.onload indicates),
	 * so the timer doesn't have to be very long. Ideally, we would look into the
	 * iframe to see if it is displaying an error, but the browser does not allow
	 * this.
	 *
	 * Some historical work which has been combined into this timer:
	 *
	 * @see https://github.com/Automattic/wp-calypso/pull/43248
	 * @see https://github.com/Automattic/wp-calypso/pull/36977
	 * @see https://github.com/Automattic/wp-calypso/pull/41006
	 * @see https://github.com/Automattic/wp-calypso/pull/44086
	 */
	editorRedirectTimer: ReturnType< typeof setTimeout > | undefined;
	setEditorRedirectTimer = ( time: number ) => {
		this.editorRedirectTimer && clearTimeout( this.editorRedirectTimer );
		this.editorRedirectTimer = setTimeout( this.tryRedirect, time );
	};

	disableRedirects = false;
	tryRedirect = () => {
		if ( this.disableRedirects ) {
			return;
		}
		window.location.replace( this.props.iframeUrl );
	};

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
			// Remove any timeouts waiting for the editor to load.
			this.disableRedirects = true;
			this.editorRedirectTimer && clearTimeout( this.editorRedirectTimer );

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
			this.props.setEditorIframeLoaded( true, this.iframePort );

			window.performance?.mark( 'iframe_loaded' );
			this.setState( { isIframeLoaded: true, currentIFrameUrl: this.props.iframeUrl } );

			return;
		}

		// this message comes from inside TinyMCE and therefore
		// cannot be controlled like the others
		if ( WindowActions.ClassicBlockOpenMediaModel === action ) {
			if ( data.imageId ) {
				const { siteId } = this.props;
				this.props.selectMediaItems( siteId, [ { ID: data.imageId } ] );
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

				this.props.selectMediaItems( siteId, selectedItems );
			} else {
				this.props.selectMediaItems( siteId, [] );
			}

			this.setState( { isMediaModalVisible: true, allowedTypes, gallery, multiple } );
		}

		if ( EditorActions.OpenCheckoutModal === action ) {
			this.checkoutPort = ports[ 0 ];
			this.setState( {
				isCheckoutModalVisible: true,
				checkoutModalOptions: payload,
			} );
		}

		if ( EditorActions.GetCheckoutModalStatus === action ) {
			const isCheckoutOverlayEnabled = config.isEnabled( 'post-editor/checkout-overlay' );

			ports[ 0 ].postMessage( {
				isCheckoutOverlayEnabled,
			} );
		}

		if ( EditorActions.SetDraftId === action && ! this.props.postId ) {
			const { postId } = payload;
			const { siteId, currentRoute, postType } = this.props;

			if ( ! currentRoute.endsWith( `/${ postId }` ) ) {
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
			window.open( postUrl, '_top' );
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
			const isGutenboarding = this.props.siteCreationFlow === 'gutenboarding';
			const currentCalypsoUrl = window.location.href; // Used to pass in the Calypso URL to Focused Launch for the "Domain I Own" flow Back Button

			ports[ 0 ].postMessage( {
				isGutenboarding,
				currentCalypsoUrl,
			} );
		}

		if ( EditorActions.ToggleInlineHelpButton === action ) {
			const inlineHelp = window.top.document.querySelector( '#wpcom > .layout > .inline-help' );

			if ( inlineHelp ) {
				inlineHelp.hidden = payload.hidden;
			}
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
			if ( Array.isArray( error ) && error.length > 4 && window.onerror ) {
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
		const { creatingNewHomepage, editedPostId, isSiteWPForTeams, siteUrl } = this.props;

		if ( creatingNewHomepage && 'publish' === status ) {
			this.setFrontPage();
		}

		if ( isSiteWPForTeams && editedPostId && siteUrl && 'publish' === status ) {
			top.location.href = addQueryArgs( { p: editedPostId }, siteUrl );
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

	closeCheckoutModal = () => {
		this.setState( { isCheckoutModalVisible: false } );
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

	/* eslint-disable @typescript-eslint/ban-types */
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
		return postId ? '/:post_type/:site/:post_id' : '/:post_type/:site';
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

	handleCheckoutSuccess = () => {
		if ( this.checkoutPort ) {
			this.checkoutPort.postMessage( 'checkout complete' );

			// this is a once-only port
			// after sending our message we want to close it out
			// and prevent sending more messages (which will be ignored)

			this.checkoutPort.close();

			this.checkoutPort = null;

			this.setState( { isCheckoutModalVisible: false } );
		}
	};

	render() {
		const { iframeUrl, shouldLoadIframe } = this.props;
		const {
			classicBlockEditorId,
			isMediaModalVisible,
			isCheckoutModalVisible,
			allowedTypes,
			multiple,
			isIframeLoaded,
			isPreviewVisible,
			previewUrl,
			postUrl,
			editedPost,
			currentIFrameUrl,
			checkoutModalOptions,
		} = this.state;

		const isUsingClassicBlock = !! classicBlockEditorId;
		const isCheckoutOverlayEnabled = config.isEnabled( 'post-editor/checkout-overlay' );
		const { redirectTo, isFocusedLaunch, ...cartData } = checkoutModalOptions || {};

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
						<Iframe
							className={ isIframeLoaded ? 'is-loaded' : '' }
							ref={ this.iframeRef }
							src={ isIframeLoaded ? currentIFrameUrl : iframeUrl }
							// NOTE: Do not include any "editor load" events in
							// this handler. It really only tracks if the document
							// has loaded. That document could just be a 404 or
							// a browser error page. Use the WindowActions.Loaded
							// onMessage handler to handle when the editor iframe
							// has loaded and started responding. This is the
							// redirect timer stage 2.
							onLoad={ () => this.setEditorRedirectTimer( 2000 ) }
							// When 3rd party cookies are disabled, the iframe
							// shows an error page that flashes for a moment
							// before the user is the redirected to wp-admin.
							// This styling hides the iframe until it loads or
							// the redirect is executed.
							style={ isIframeLoaded ? undefined : { opacity: 0 } }
						/>
					) }
				</div>
				<AsyncLoad
					require="calypso/post-editor/editor-media-modal"
					placeholder={ null }
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
				{ isCheckoutOverlayEnabled && (
					<AsyncLoad
						checkoutOnSuccessCallback={ this.handleCheckoutSuccess }
						require="calypso/blocks/editor-checkout-modal"
						onClose={ this.closeCheckoutModal }
						placeholder={ null }
						isOpen={ isCheckoutModalVisible }
						cartData={ cartData }
						redirectTo={ redirectTo }
						isFocusedLaunch={ isFocusedLaunch }
					/>
				) }
				<AsyncLoad
					require="calypso/post-editor/editor-revisions/dialog"
					placeholder={ null }
					loadRevision={ this.loadRevision }
				/>
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
		anchorFmData,
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
		...anchorFmData,
	} );

	// needed for loading the editor in SU sessions
	if ( wpcom.addSupportParams ) {
		queryArgs = wpcom.addSupportParams( queryArgs );
	}

	// Pass through to iframed editor if user is in editor deprecation group.
	if ( 'classic' === getSelectedEditor( state, siteId ) ) {
		queryArgs[ 'in-editor-deprecation-group' ] = 1;
	}

	const siteAdminUrl =
		editorType === 'site'
			? getSiteAdminUrl( state, siteId, 'admin.php?page=gutenberg-edit-site' )
			: getSiteAdminUrl( state, siteId, postId ? 'post.php' : 'post-new.php' );

	const iframeUrl = addQueryArgs( queryArgs, siteAdminUrl );

	// Prevents the iframe from loading using a cached frame nonce.
	const shouldLoadIframe = ! isRequestingSite( state, siteId );

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
		isSiteWPForTeams: isSiteWPForTeams( state, siteId ),
		postTypeTrashUrl,
		shouldLoadIframe,
		siteAdminUrl,
		siteId,
		siteSlug,
		siteUrl: getSiteUrl( state, siteId ),
		customizerUrl: getCustomizerUrl( state, siteId ),
		// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
		getTemplateEditorUrl: partial(
			getEditorUrl,
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
	};
};

const mapDispatchToProps = {
	replaceHistory,
	setRoute,
	navigate,
	openPostRevisionsDialog,
	setEditorIframeLoaded,
	startEditingPost,
	editPost,
	trashPost,
	updateSiteFrontPage,
	selectMediaItems,
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
