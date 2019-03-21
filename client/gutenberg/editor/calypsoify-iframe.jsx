/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { endsWith, get, map, pickBy, startsWith } from 'lodash';
import PropTypes from 'prop-types';
import url from 'url';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaModal from 'post-editor/media-modal';
import MediaActions from 'lib/media/actions';
import MediaStore from 'lib/media/store';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteOption, getSiteAdminUrl } from 'state/sites/selectors';
import { addQueryArgs } from 'lib/route';
import { getEnabledFilters, getDisabledDataSources, mediaCalypsoToGutenberg } from './media-utils';
import { replaceHistory, setRoute, navigate } from 'state/ui/actions';
import getCurrentRoute from 'state/selectors/get-current-route';
import getPostTypeTrashUrl from 'state/selectors/get-post-type-trash-url';
import getPostTypeAllPostsUrl from 'state/selectors/get-post-type-all-posts-url';
import wpcom from 'lib/wp';
import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';
import { openPostRevisionsDialog } from 'state/posts/revisions/actions';
import { startEditingPost } from 'state/ui/editor/actions';
import { Placeholder } from './placeholder';
import WebPreview from 'components/web-preview';

/**
 * Style dependencies
 */
import './style.scss';

class CalypsoifyIframe extends Component {
	static propTypes = {
		postId: PropTypes.number,
		postType: PropTypes.string,
		duplicatePostId: PropTypes.number,
		pressThis: PropTypes.object,
	};

	state = {
		isMediaModalVisible: false,
		isIframeLoaded: false,
		isPreviewVisible: false,
		previewUrl: 'about:blank',
		postUrl: null,
		editedPost: null,
	};

	constructor( props ) {
		super( props );
		this.iframeRef = React.createRef();
		this.mediaSelectPort = null;
		MediaStore.on( 'change', this.updateImageBlocks );
	}

	componentDidMount() {
		window.addEventListener( 'message', this.onMessage, false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.onMessage, false );
	}

	onMessage = ( { data, origin } ) => {
		if ( ! data || 'gutenbergIframeMessage' !== data.type ) {
			return;
		}

		const isValidOrigin = this.props.siteAdminUrl.indexOf( origin ) === 0;

		if ( ! isValidOrigin ) {
			return;
		}

		const { action } = data;

		if ( 'loaded' === action ) {
			const { port1: portToIframe, port2: portForIframe } = new MessageChannel();

			this.iframePort = portToIframe;
			this.iframePort.addEventListener( 'message', this.onIframePortMessage, false );
			this.iframePort.start();

			this.iframeRef.current.contentWindow.postMessage( { action: 'initPort' }, '*', [
				portForIframe,
			] );

			// Check if we're generating a post via Press This
			this.pressThis();
		}
	};

	onIframePortMessage = ( { data, ports } ) => {
		const { action, payload } = data;

		if ( 'openMediaModal' === action ) {
			const { siteId } = this.props;
			const { allowedTypes, gallery, multiple, value } = payload;

			if ( ports && ports[ 0 ] ) {
				// set imperatively on the instance because this is not
				// the kind of assignment which causes re-renders and we
				// want it set immediately
				this.mediaSelectPort = ports[ 0 ];
			}

			if ( value ) {
				const selectedItems = Array.isArray( value )
					? map( value, item => ( { ID: parseInt( item, 10 ) } ) )
					: [ { ID: parseInt( value, 10 ) } ];
				MediaActions.setLibrarySelectedItems( siteId, selectedItems );
			} else {
				MediaActions.setLibrarySelectedItems( siteId, [] );
			}

			this.setState( { isMediaModalVisible: true, allowedTypes, gallery, multiple } );
		}

		if ( 'draftIdSet' === action && ! this.props.postId ) {
			const { postId } = payload;
			const { siteId, currentRoute } = this.props;

			if ( ! endsWith( currentRoute, `/${ postId }` ) ) {
				this.props.replaceHistory( `${ currentRoute }/${ postId }`, true );
				this.props.setRoute( `${ currentRoute }/${ postId }` );

				//set postId on state.ui.editor.postId, so components like editor revisions can read from it
				this.props.startEditingPost( siteId, postId );
			}
		}

		if ( 'postTrashed' === action ) {
			this.props.navigate( this.props.postTypeTrashUrl );
		}

		if ( 'goToAllPosts' === action ) {
			this.props.navigate( this.props.allPostsUrl );
		}

		if ( 'openRevisions' === action ) {
			this.props.openPostRevisionsDialog();
		}

		if ( 'previewPost' === action ) {
			const { postUrl } = payload;
			this.openPreviewModal( { postUrl, previewPort: ports[ 0 ] } );
		}
	};

	loadRevision = revision => {
		this.iframePort.postMessage( {
			action: 'loadRevision',
			payload: {
				title: revision.post_title,
				excerpt: revision.post_excerpt,
				content: revision.post_content,
			},
		} );
	};

	closeMediaModal = media => {
		if ( media && this.iframePort ) {
			const { multiple } = this.state;
			const formattedMedia = map( media.items, item => mediaCalypsoToGutenberg( item ) );
			const payload = multiple ? formattedMedia : formattedMedia[ 0 ];

			if ( this.mediaSelectPort ) {
				this.mediaSelectPort.postMessage( payload );

				// this is a once-only port
				// after sending our message we want to close it out
				// and prevent sending more messages (which will be ignored)
				this.mediaSelectPort.close();
				this.mediaSelectPort = null;
			} else {
				// this to be removed once we are reliably
				// sending the new MessageChannel from the server
				this.iframePort.postMessage( {
					action: 'selectMedia',
					payload,
				} );
			}
		}

		this.setState( { isMediaModalVisible: false } );
	};

	pressThis = () => {
		const { pressThis } = this.props;
		if ( pressThis ) {
			this.iframePort.postMessage( {
				action: 'pressThis',
				payload: pressThis,
			} );
		}
	};

	updateImageBlocks = action => {
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
			url: get( action, 'data.URL' ),
			transientId: get( action, 'id' ),
			status: 'REMOVE_MEDIA_ITEM' === action.type ? 'deleted' : 'updated',
		};
		this.iframePort.postMessage( { action: 'updateImageBlocks', payload } );
	};

	openPreviewModal = ( { postUrl, previewPort } ) => {
		this.setState( {
			isPreviewVisible: true,
			previewUrl: 'about:blank',
			postUrl,
		} );

		previewPort.onmessage = message => {
			previewPort.close();

			const { frameNonce } = this.props;
			const { previewUrl, editedPost } = message.data;

			const parsedPreviewUrl = url.parse( previewUrl, true );
			if ( frameNonce ) {
				parsedPreviewUrl.query[ 'frame-nonce' ] = frameNonce;
			}
			delete parsedPreviewUrl.search;

			this.setState( {
				previewUrl: url.format( parsedPreviewUrl ),
				editedPost,
			} );
		};
	};

	closePreviewModal = () => this.setState( { isPreviewVisible: false } );

	render() {
		const { iframeUrl, siteId } = this.props;
		const {
			isMediaModalVisible,
			allowedTypes,
			multiple,
			isIframeLoaded,
			isPreviewVisible,
			previewUrl,
			postUrl,
			editedPost,
		} = this.state;

		return (
			<Fragment>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<div className="main main-column calypsoify is-iframe" role="main">
					{ ! isIframeLoaded && <Placeholder /> }
					{ /* eslint-disable-next-line jsx-a11y/iframe-has-title */ }
					<iframe
						ref={ this.iframeRef }
						/* eslint-disable-next-line wpcalypso/jsx-classname-namespace */
						className={ isIframeLoaded ? 'is-iframe-loaded' : undefined }
						src={ iframeUrl }
						onLoad={ () => this.setState( { isIframeLoaded: true } ) }
					/>
				</div>
				<MediaLibrarySelectedData siteId={ siteId }>
					<MediaModal
						disabledDataSources={ getDisabledDataSources( allowedTypes ) }
						enabledFilters={ getEnabledFilters( allowedTypes ) }
						galleryViewEnabled={ false }
						onClose={ this.closeMediaModal }
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

const mapStateToProps = ( state, { postId, postType, duplicatePostId } ) => {
	const siteId = getSelectedSiteId( state );
	const currentRoute = getCurrentRoute( state );
	const postTypeTrashUrl = getPostTypeTrashUrl( state, postType );
	const frameNonce = getSiteOption( state, siteId, 'frame_nonce' ) || '';

	let queryArgs = pickBy( {
		post: postId,
		action: postId && 'edit', // If postId is set, open edit view.
		post_type: postType !== 'post' && postType, // Use postType if it's different than post.
		calypsoify: 1,
		'block-editor': 1,
		'frame-nonce': frameNonce,
		'jetpack-copy': duplicatePostId,
		origin: window.location.origin,
	} );

	// needed for loading the editor in SU sessions
	if ( wpcom.addSupportParams ) {
		queryArgs = wpcom.addSupportParams( queryArgs );
	}

	const siteAdminUrl = getSiteAdminUrl( state, siteId, postId ? 'post.php' : 'post-new.php' );

	const iframeUrl = addQueryArgs( queryArgs, siteAdminUrl );

	return {
		allPostsUrl: getPostTypeAllPostsUrl( state, postType ),
		siteId,
		currentRoute,
		iframeUrl,
		postTypeTrashUrl,
		siteAdminUrl,
		frameNonce,
	};
};

const mapDispatchToProps = {
	replaceHistory,
	setRoute,
	navigate,
	openPostRevisionsDialog,
	startEditingPost,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( CalypsoifyIframe );
