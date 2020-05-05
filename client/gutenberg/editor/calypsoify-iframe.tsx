/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { endsWith, get, map, partial, pickBy, startsWith, isArray } from 'lodash';
import url from 'url';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaActions from 'lib/media/actions';
import MediaStore from 'lib/media/store';
import EditorMediaModal from 'post-editor/editor-media-modal';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getCustomizerUrl,
	getSiteOption,
	getSiteAdminUrl,
	isRequestingSites,
	isRequestingSite,
	isJetpackSite,
} from 'state/sites/selectors';
import { addQueryArgs } from 'lib/route';
import { getEnabledFilters, getDisabledDataSources, mediaCalypsoToGutenberg } from './media-utils';
import { replaceHistory, setRoute, navigate } from 'state/ui/actions';
import { updateSiteFrontPage } from 'state/sites/actions';
import getCurrentRoute from 'state/selectors/get-current-route';
import getPostTypeTrashUrl from 'state/selectors/get-post-type-trash-url';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import getEditorCloseConfig from 'state/selectors/get-editor-close-config';
import wpcom from 'lib/wp';
import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';
import { openPostRevisionsDialog } from 'state/posts/revisions/actions';
import { setEditorIframeLoaded, startEditingPost } from 'state/ui/editor/actions';
import { Placeholder } from './placeholder';
import WebPreview from 'components/web-preview';
import { editPost, trashPost } from 'state/posts/actions';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { protectForm, ProtectedFormProps } from 'lib/protect-form';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import ConvertToBlocksDialog from 'components/convert-to-blocks';
import config from 'config';
import EditorDocumentHead from 'post-editor/editor-document-head';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';

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
	isConversionPromptVisible: boolean;
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
	SetDraftId = 'draftIdSet',
	TrashPost = 'trashPost',
	ConversionRequest = 'triggerConversionRequest',
	OpenCustomizer = 'openCustomizer',
	GetTemplateEditorUrl = 'getTemplateEditorUrl',
	OpenTemplatePart = 'openTemplatePart',
	GetCloseButtonUrl = 'getCloseButtonUrl',
	LogError = 'logError',
	GetGutenboardingStatus = 'getGutenboardingStatus',
}

class CalypsoifyIframe extends Component< Props & ConnectedProps & ProtectedFormProps, State > {
	state: State = {
		isMediaModalVisible: false,
		isIframeLoaded: false,
		isPreviewVisible: false,
		isConversionPromptVisible: false,
		previewUrl: 'about:blank',
		currentIFrameUrl: '',
	};

	iframeRef: React.RefObject< HTMLIFrameElement > = React.createRef();
	iframePort: MessagePort | null = null;
	conversionPort: MessagePort | null = null;
	mediaSelectPort: MessagePort | null = null;
	revisionsPort: MessagePort | null = null;
	successfulIframeLoad = false;

	componentDidMount() {
		MediaStore.on( 'change', this.updateImageBlocks );
		window.addEventListener( 'message', this.onMessage, false );
	}

	componentWillUnmount() {
		MediaStore.off( 'change', this.updateImageBlocks );
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
				const image = MediaStore.get( siteId, data.imageId );
				MediaActions.setLibrarySelectedItems( siteId, [ image ] );
			}

			this.setState( {
				classicBlockEditorId: data.editorId,
				isMediaModalVisible: true,
				multiple: true,
			} );
		}

		// any other message is unknown and may indicate a bug
	};

	onIframePortMessage = ( { data, ports }: MessageEvent ) => {
		/* eslint-disable @typescript-eslint/no-explicit-any */
		const { action, payload }: { action: EditorActions; payload: any } = data;

		if ( EditorActions.OpenMediaModal === action && ports && ports[ 0 ] ) {
			const { siteId } = this.props;
			const { allowedTypes, gallery, multiple, value } = payload;

			// set imperatively on the instance because this is not
			// the kind of assignment which causes re-renders and we
			// want it set immediately
			this.mediaSelectPort = ports[ 0 ];

			if ( value ) {
				const ids = Array.isArray( value )
					? value.map( ( item ) => parseInt( item, 10 ) )
					: [ parseInt( value, 10 ) ];
				const selectedItems = ids.map( ( id ) => {
					const media = MediaStore.get( siteId, id );
					if ( ! media ) {
						MediaActions.fetch( siteId, id );
					}
					return {
						ID: id,
						...media,
					};
				} );

				MediaActions.setLibrarySelectedItems( siteId, selectedItems );
			} else {
				MediaActions.setLibrarySelectedItems( siteId, [] );
			}

			this.setState( { isMediaModalVisible: true, allowedTypes, gallery, multiple } );
		}

		if ( EditorActions.ConversionRequest === action ) {
			this.conversionPort = ports[ 0 ];
			this.setState( { isConversionPromptVisible: true } );
		}

		if ( EditorActions.SetDraftId === action && ! this.props.postId ) {
			const { postId } = payload;
			const { siteId, currentRoute, postType } = this.props;

			if ( ! endsWith( currentRoute, `/${ postId }` ) ) {
				this.props.replaceHistory( `${ currentRoute }/${ postId }`, true );
				this.props.setRoute( `${ currentRoute }/${ postId }` );

				//set postId on state.ui.editor.postId, so components like editor revisions can read from it
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
				config.isEnabled( 'gutenboarding' ) &&
				this.props.siteCreationFlow === 'gutenboarding' &&
				this.props.isSiteUnlaunched;
			ports[ 0 ].postMessage( {
				isGutenboarding,
				frankenflowUrl: `${ window.location.origin }/start/new-launch?siteSlug=${ this.props.siteId }&source=editor`,
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

	updateImageBlocks = ( action: { data: { mime_type: string; URL: string }; type: string } ) => {
		if (
			! this.iframePort ||
			! action ||
			! startsWith( action.data.mime_type, 'image/' ) ||
			startsWith( action.data.URL, 'blob:' )
		) {
			return;
		}
		const payload = {
			id: get( action, 'data.ID' ),
			height: get( action, 'data.height' ),
			status: 'REMOVE_MEDIA_ITEM' === action.type ? 'deleted' : 'updated',
			transientId: get( action, 'id' ),
			url: get( action, 'data.URL' ),
			width: get( action, 'data.width' ),
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

	handleConversionResponse = ( confirmed: boolean ) => {
		this.setState( { isConversionPromptVisible: false } );

		if ( ! this.conversionPort ) {
			return;
		}

		this.conversionPort.postMessage( confirmed );

		this.conversionPort.close();
		this.conversionPort = null;
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
		const { iframeUrl, siteId, shouldLoadIframe } = this.props;
		const {
			classicBlockEditorId,
			isMediaModalVisible,
			allowedTypes,
			multiple,
			isIframeLoaded,
			isPreviewVisible,
			isConversionPromptVisible,
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
				<ConvertToBlocksDialog
					showDialog={ isConversionPromptVisible }
					handleResponse={ this.handleConversionResponse }
				/>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<div className="main main-column calypsoify is-iframe" role="main">
					{ ! isIframeLoaded && <Placeholder /> }
					{ ( shouldLoadIframe || isIframeLoaded ) && (
						/* eslint-disable jsx-a11y/iframe-has-title */
						<iframe
							ref={ this.iframeRef }
							/* eslint-disable-next-line wpcalypso/jsx-classname-namespace */
							className={ isIframeLoaded ? 'is-iframe-loaded' : undefined }
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
				<MediaLibrarySelectedData siteId={ siteId }>
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
				</MediaLibrarySelectedData>
				<EditorRevisionsDialog loadRevision={ this.loadRevision } />
				<WebPreview
					externalUrl={ postUrl }
					onClose={ this.closePreviewModal }
					overridePost={ editedPost }
					previewUrl={ previewUrl }
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
		creatingNewHomepage,
		editorType = 'post',
	}: Props
) => {
	const siteId = getSelectedSiteId( state );
	const currentRoute = getCurrentRoute( state );
	const postTypeTrashUrl = getPostTypeTrashUrl( state, postType );
	const siteOption = isJetpackSite( state, siteId ) ? 'jetpack_frame_nonce' : 'frame_nonce';

	let queryArgs = pickBy( {
		post: postId,
		action: postId && 'edit', // If postId is set, open edit view.
		post_type: postType !== 'post' && postType, // Use postType if it's different than post.
		calypsoify: 1,
		fse_parent_post: fseParentPageId != null && fseParentPageId,
		'block-editor': 1,
		'frame-nonce': getSiteOption( state, siteId, siteOption ) || '',
		'jetpack-copy': duplicatePostId,
		origin: window.location.origin,
		'environment-id': config( 'env_id' ),
		'new-homepage': creatingNewHomepage,
	} );

	// needed for loading the editor in SU sessions
	if ( wpcom.addSupportParams ) {
		queryArgs = wpcom.addSupportParams( queryArgs );
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
};

type ConnectedProps = ReturnType< typeof mapStateToProps > & typeof mapDispatchToProps;

export default connect( mapStateToProps, mapDispatchToProps )( protectForm( CalypsoifyIframe ) );
