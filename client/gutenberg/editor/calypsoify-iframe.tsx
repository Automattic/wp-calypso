import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { localize, LocalizeProps } from 'i18n-calypso';
import { map, pickBy, flowRight } from 'lodash';
import { Component, Fragment } from 'react';
import * as React from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { BlockEditorSettings } from 'calypso/data/block-editor/use-block-editor-settings-query';
import withBlockEditorSettings from 'calypso/data/block-editor/with-block-editor-settings';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import memoizeLast from 'calypso/lib/memoize-last';
import { navigate } from 'calypso/lib/navigate';
import { withStopPerformanceTrackingProp } from 'calypso/lib/performance-tracking';
import { protectForm, ProtectedFormProps } from 'calypso/lib/protect-form';
import { addQueryArgs } from 'calypso/lib/route';
import wpcom from 'calypso/lib/wp';
import EditorDocumentHead from 'calypso/post-editor/editor-document-head';
import { setEditorIframeLoaded, startEditingPost } from 'calypso/state/editor/actions';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { selectMediaItems } from 'calypso/state/media/actions';
import { fetchMediaItem, getMediaItem } from 'calypso/state/media/thunks';
import { editPost, trashPost } from 'calypso/state/posts/actions';
import { openPostRevisionsDialog } from 'calypso/state/posts/revisions/actions';
import { clearLastNonEditorRoute, setRoute } from 'calypso/state/route/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getEditorCloseConfig from 'calypso/state/selectors/get-editor-close-config';
import getPostTypeTrashUrl from 'calypso/state/selectors/get-post-type-trash-url';
import getSiteUrl from 'calypso/state/selectors/get-site-url';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import shouldDisplayAppBanner from 'calypso/state/selectors/should-display-app-banner';
import { updateSiteFrontPage } from 'calypso/state/sites/actions';
import {
	getCustomizerUrl,
	getSiteOption,
	getSiteAdminUrl,
	isRequestingSite,
	isJetpackSite,
	getSite,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import isAppBannerDismissed from 'calypso/state/ui/selectors/app-banner-is-dismissed';
import * as T from 'calypso/types';
import Iframe from './iframe';
import { getEnabledFilters, getDisabledDataSources, mediaCalypsoToGutenberg } from './media-utils';
import { Placeholder } from './placeholder';
import type { RequestCart } from '@automattic/shopping-cart';
import type { PerformanceTrackProps } from 'calypso/lib/performance-tracking/index.web';
import './style.scss';

interface Props {
	duplicatePostId: T.PostId;
	creatingNewHomepage?: boolean;
	postId: T.PostId;
	postType: T.PostType;
	editorType: 'site' | 'post'; // Note: a page or other CPT is a type of post.
	pressThisData: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	bloggingPromptData: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	anchorFmData: {
		anchor_podcast: string | undefined;
		anchor_episode: string | undefined;
		spotify_url: string | undefined;
	};
	siteAdminUrl: T.URL | null;
	parentPostId: T.PostId;
	stripeConnectSuccess: 'gutenberg' | null;
	showDraftPostModal: boolean;
	blockEditorSettings: BlockEditorSettings;
}

interface CheckoutModalOptions extends RequestCart {
	redirectTo?: string;
	isFocusedLaunch?: boolean;
}

interface State {
	allowedTypes?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	classicBlockEditorId?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	isIframeLoaded: boolean;
	currentIFrameUrl: string;
	isMediaModalVisible: boolean;
	isCheckoutModalVisible: boolean;
	multiple?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	postUrl?: T.URL;
	checkoutModalOptions?: CheckoutModalOptions;
}

enum WindowActions {
	Loaded = 'loaded',
	ClassicBlockOpenMediaModel = 'classicBlockOpenMediaModal',
}

enum EditorActions {
	GoToAllPosts = 'goToAllPosts', // Unused action in favor of CloseEditor. Maintained here to support cached scripts.
	WpAdminRedirect = 'wpAdminRedirect',
	CloseEditor = 'closeEditor',
	OpenMediaModal = 'openMediaModal',
	OpenCheckoutModal = 'openCheckoutModal',
	GetCheckoutModalStatus = 'getCheckoutModalStatus',
	OpenRevisions = 'openRevisions',
	PostStatusChange = 'postStatusChange',
	OpenLinkInParentFrame = 'openLinkInParentFrame',
	ViewPost = 'viewPost',
	SetDraftId = 'draftIdSet',
	TrashPost = 'trashPost',
	OpenCustomizer = 'openCustomizer',
	GetCloseButtonUrl = 'getCloseButtonUrl',
	GetGutenboardingStatus = 'getGutenboardingStatus',
	GetNavSidebarLabels = 'getNavSidebarLabels',
	GetCalypsoUrlInfo = 'getCalypsoUrlInfo',
	TrackPerformance = 'trackPerformance',
	GetIsAppBannerVisible = 'getIsAppBannerVisible',
	NavigateToHome = 'navigateToHome',
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
		currentIFrameUrl: '',
		checkoutModalOptions: undefined,
	};

	iframeRef: React.RefObject< HTMLIFrameElement > = React.createRef();
	iframePort: MessagePort | null = null;
	mediaSelectPort: MessagePort | null = null;
	mediaCancelPort: MessagePort | null = null;
	revisionsPort: MessagePort | null = null;
	checkoutPort: MessagePort | null = null;
	appBannerPort: MessagePort | null = null;

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

		if ( this.props.appBannerDismissed ) {
			this.handleAppBannerDismiss();
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

		// We have to remove the `frame-nonce` after the redirection to prevent it
		// from being thought to be embedded in an iframe.
		const redirectUrl = removeQueryArgs( this.props.iframeUrl, 'frame-nonce' );
		window.location.replace( redirectUrl );
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

			// Notify external listeners that the iframe has loaded
			this.props.setEditorIframeLoaded( true, this.iframePort );

			window.performance?.mark?.( 'iframe_loaded' );
			this.setState( { isIframeLoaded: true, currentIFrameUrl: this.props.iframeUrl } );

			return;
		}

		// this message comes from inside TinyMCE and therefore
		// cannot be controlled like the others
		if ( WindowActions.ClassicBlockOpenMediaModel === action ) {
			if ( data.imageId ) {
				const { siteId } = this.props;
				this.props.selectMediaItems( siteId ?? 0, [ { ID: data.imageId } ] );
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

		const { action, payload }: { action: EditorActions; payload: any } = data; // eslint-disable-line @typescript-eslint/no-explicit-any

		if ( EditorActions.OpenMediaModal === action && ports && ports[ 0 ] ) {
			const { siteId } = this.props;
			const { allowedTypes, multiple, value } = payload;

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
					const media = this.props.getMediaItem( siteId ?? 0, id );
					if ( ! media ) {
						this.props.fetchMediaItem( siteId, id );
					}
					return {
						ID: id,
						...media,
					};
				} );

				this.props.selectMediaItems( siteId ?? 0, selectedItems );
			} else {
				this.props.selectMediaItems( siteId ?? 0, [] );
			}

			this.setState( { isMediaModalVisible: true, allowedTypes, multiple } );
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
				// Replace the URL in history but don't dispatch a new navigation event
				page.replace( `${ currentRoute }/${ postId }`, null, false, false );
				this.props.setRoute( `${ currentRoute }/${ postId }` );

				//set postId on state.editor.postId, so components like editor revisions can read from it
				this.props.startEditingPost( siteId ?? 0, postId );

				//set post type on state.posts.[ id ].type, so components like document head can read from it
				this.props.editPost( siteId ?? 0, postId, { type: postType } );
			}
		}

		if ( EditorActions.TrashPost === action ) {
			const { siteId, editedPostId, postTypeTrashUrl } = this.props;
			if ( typeof siteId === 'number' && typeof editedPostId === 'number' ) {
				this.props.trashPost( siteId, editedPostId );
			}
			navigate( postTypeTrashUrl );
		}

		if ( EditorActions.CloseEditor === action || EditorActions.GoToAllPosts === action ) {
			let unsavedChanges = false;
			let destinationUrl = this.props.closeUrl;
			if ( payload?.unsavedChanges ) {
				unsavedChanges = payload.unsavedChanges;
			}
			if ( payload?.destinationUrl ) {
				destinationUrl = payload.destinationUrl;
			}
			this.props.setEditorIframeLoaded( false );
			this.navigate( destinationUrl, unsavedChanges );
		}

		if ( EditorActions.WpAdminRedirect === action ) {
			const { destinationUrl, unsavedChanges } = payload;

			this.navigate( `https://${ this.props.siteSlug }${ destinationUrl }`, unsavedChanges );
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

		if ( EditorActions.ViewPost === action ) {
			const { postUrl } = payload;
			window.open( postUrl, '_top' );
		}

		if ( EditorActions.OpenLinkInParentFrame === action ) {
			const { postUrl } = payload;
			window.open( postUrl, '_top' );
		}

		if ( EditorActions.OpenCustomizer === action ) {
			const { autofocus = null, unsavedChanges = false } = payload;
			this.openCustomizer( autofocus, unsavedChanges );
		}

		if ( EditorActions.GetCloseButtonUrl === action ) {
			const { closeUrl, closeLabel } = this.props;

			// If the closeLabel isn't a string, it's a React component and we can't serialize it over a message.
			// Don't send the message and allow the editor to use it's default close URL and label.
			if ( typeof closeLabel === 'string' ) {
				ports[ 0 ].postMessage( {
					closeUrl: `${ window.location.origin }${ closeUrl }`,
					label: closeLabel,
				} );
			}
		}

		if ( EditorActions.GetGutenboardingStatus === action ) {
			const isGutenboarding = this.props.siteCreationFlow === 'gutenboarding';
			const currentCalypsoUrl = window.location.href; // Used to pass in the Calypso URL to Focused Launch for the "Domain I Own" flow Back Button

			ports[ 0 ].postMessage( {
				isGutenboarding,
				currentCalypsoUrl,
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

		if ( EditorActions.GetIsAppBannerVisible === action ) {
			const isAppBannerVisible = this.props.shouldDisplayAppBanner;
			ports[ 0 ].postMessage( {
				isAppBannerVisible,
				hasAppBannerBeenDismissed: false,
			} );

			// If App Banner is not visible, we won't need to notify the Welcome Tour after its dismission
			if ( isAppBannerVisible ) {
				this.appBannerPort = ports[ 0 ];
			}
		}

		if ( EditorActions.NavigateToHome === action ) {
			page( `/home/${ this.props.siteSlug }` );
		}
	};

	handlePostStatusChange = ( status: string ) => {
		const { creatingNewHomepage, editedPostId, isSiteWPForTeams, siteUrl } = this.props;

		if ( creatingNewHomepage && 'publish' === status ) {
			this.setFrontPage();
		}

		if ( isSiteWPForTeams && editedPostId && siteUrl && 'publish' === status && top ) {
			top.location.href = addQueryArgs( { p: editedPostId }, siteUrl );
		}
	};

	setFrontPage = () => {
		const { editedPostId, siteId } = this.props;
		this.props.updateSiteFrontPage( siteId ?? 0, {
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

	/* eslint-disable-next-line @typescript-eslint/ban-types */
	openCustomizer = ( autofocus: object, unsavedChanges: boolean ) => {
		let { customizerUrl } = this.props;
		if ( ! customizerUrl ) {
			return;
		}

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

	navigate = ( navUrl: string, unsavedChanges: boolean ) => {
		const { markChanged, markSaved } = this.props;
		unsavedChanges ? markChanged() : markSaved();
		navigate( navUrl );
	};

	getStatsPath = () => {
		const { postId } = this.props;
		return postId ? '/:post_type/:site/:post_id' : '/:post_type/:site';
	};

	getStatsProps = () => {
		const { postId, postType } = this.props;
		return this.getStatsPropertiesForProps( postId, postType );
	};

	getStatsPropertiesForProps = memoizeLast( ( postId, postType ) =>
		postId ? { post_type: postType, post_id: postId } : { post_type: postType }
	);

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

	// IMPORTANT NOTE: This will not be called for redirect payment methods like
	// PayPal. They will redirect directly to the post-checkout page decided by
	// `getThankYouUrl`.
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

	handleAppBannerDismiss = () => {
		if ( this.appBannerPort ) {
			this.appBannerPort.postMessage( {
				isAppBannerVisible: false,
				hasAppBannerBeenDismissed: true,
			} );

			this.appBannerPort.close();
			this.appBannerPort = null;
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
							// Allow clipboard access for the iframe origin.
							// This will still require users' permissions.
							allow="clipboard-read; clipboard-write"
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
		parentPostId,
		creatingNewHomepage,
		editorType = 'post',
		stripeConnectSuccess,
		anchorFmData,
		showDraftPostModal,
		pressThisData,
		bloggingPromptData,
		blockEditorSettings,
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
		parent_post: parentPostId != null && parentPostId,
		'block-editor': 1,
		'frame-nonce': getSiteOption( state, siteId, siteOption ) || '',
		'jetpack-copy': duplicatePostId,
		origin: window.location.origin,
		'environment-id': config( 'env_id' ),
		'new-homepage': creatingNewHomepage,
		...( !! stripeConnectSuccess && { stripe_connect_success: stripeConnectSuccess } ),
		...anchorFmData,
		openSidebar: getQueryArg( window.location.href, 'openSidebar' ),
		showDraftPostModal,
		...pressThisData,
		...bloggingPromptData,
		canvas: getQueryArg( window.location.href, 'canvas' ), // Site editor can initially load with or without nav sidebar (Gutenberg v15.0.0)
	} );

	// needed for loading the editor in SU sessions
	if ( wpcom.addSupportParams ) {
		queryArgs = wpcom.addSupportParams( queryArgs );
	}

	// Add new Site Editor params introduced in https://github.com/WordPress/gutenberg/pull/38817.
	if ( 'site' === editorType && blockEditorSettings?.home_template?.postType ) {
		const templateType = getQueryArg( window.location.href, 'templateType' );
		const templateId = getQueryArg( window.location.href, 'templateId' );
		if ( templateType && templateId ) {
			queryArgs.postType = templateType;
			queryArgs.postId = templateId;
		} else if ( blockEditorSettings?.home_template?.postType ) {
			queryArgs.postType = blockEditorSettings.home_template.postType;
			queryArgs.postId = blockEditorSettings.home_template.postId;
		}
	}

	const noticePattern = /[&?]notice=([\w_-]+)/;
	const match = noticePattern.exec( document.location.search );
	const notice = match && match[ 1 ];

	if ( notice ) {
		queryArgs.notice = notice;
	}

	const siteAdminUrl =
		editorType === 'site'
			? getSiteAdminUrl( state, siteId, 'site-editor.php' )
			: getSiteAdminUrl( state, siteId, postId ? 'post.php' : 'post-new.php' );

	const iframeUrl = addQueryArgs( queryArgs, siteAdminUrl ?? '' );

	// Prevents the iframe from loading using a cached frame nonce.
	const shouldLoadIframe = ! isRequestingSite( state, siteId ?? 0 );

	const { url: closeUrl, label: closeLabel } = getEditorCloseConfig( state, siteId, postType );

	// 'shouldDisplayAppBanner' does not check if we're in Blogger Flow, because it is a selector reading from the Redux state, and
	// the Blogger Flow information is not in the Redux state, but in the session storage value wpcom_signup_complete_show_draft_post_modal.
	// So instead we get that information from 'showDraftPostModal'
	const displayAppBanner = shouldDisplayAppBanner( state ) && ! showDraftPostModal;

	return {
		closeUrl,
		closeLabel,
		currentRoute,
		editedPostId: getEditorPostId( state ),
		frameNonce: getSiteOption( state, siteId, 'frame_nonce' ) || '',
		iframeUrl,
		isSiteWPForTeams: isSiteWPForTeams( state, siteId ?? 0 ),
		postTypeTrashUrl,
		shouldLoadIframe,
		siteAdminUrl,
		siteId,
		siteSlug,
		siteUrl: getSiteUrl( state, siteId ?? 0 ),
		customizerUrl: getCustomizerUrl( state, siteId ),
		unmappedSiteUrl: getSiteOption( state, siteId, 'unmapped_url' ),
		siteCreationFlow: getSiteOption( state, siteId, 'site_creation_flow' ),
		isSiteUnlaunched: isUnlaunchedSite( state, siteId ),
		site: getSite( state, siteId ?? 0 ),
		parentPostId,
		shouldDisplayAppBanner: displayAppBanner,
		appBannerDismissed: isAppBannerDismissed( state ),
	};
};

const mapDispatchToProps = {
	setRoute,
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
	withBlockEditorSettings,
	connect( mapStateToProps, mapDispatchToProps ),
	localize,
	protectForm
)( CalypsoifyIframe );
