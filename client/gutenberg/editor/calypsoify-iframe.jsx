/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { endsWith, flow, get, map, pickBy, startsWith } from 'lodash';
import PropTypes from 'prop-types';
import url from 'url';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaActions from 'lib/media/actions';
import MediaStore from 'lib/media/store';
import EditorMediaModal from 'post-editor/editor-media-modal';
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
import { trashPost } from 'state/posts/actions';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { protectForm } from 'lib/protect-form';

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
		markChanged: PropTypes.func.isRequired,
		markSaved: PropTypes.func.isRequired,
	};

	state = {
		classicBlockEditorId: null,
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
		this.revisionsPort = null;
	}

	componentDidMount() {
		MediaStore.on( 'change', this.updateImageBlocks );
		window.addEventListener( 'message', this.onMessage, false );
	}

	componentWillUnmount() {
		MediaStore.off( 'change', this.updateImageBlocks );
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
			const { port1: iframePortObject, port2: transferredPortObject } = new MessageChannel();

			this.iframePort = iframePortObject;
			this.iframePort.addEventListener( 'message', this.onIframePortMessage, false );
			this.iframePort.start();

			this.iframeRef.current.contentWindow.postMessage( { action: 'initPort' }, '*', [
				transferredPortObject,
			] );

			// Check if we're generating a post via Press This
			this.pressThis();
			return;
		}

		// this message comes from inside TinyMCE and therefore
		// cannot be controlled like the others
		if ( 'classicBlockOpenMediaModal' === action ) {
			if ( data.imageId ) {
				const { siteId } = this.props;
				const image = MediaStore.get( siteId, data.imageId );
				MediaActions.setLibrarySelectedItems( siteId, [ image ] );
			}

			this.setState( {
				classicBlockEditorId: data.editorId,
				isMediaModalVisible: true,
			} );
		}

		// any other message is unknown and may indicate a bug
	};

	onIframePortMessage = ( { data, ports } ) => {
		const { action, payload } = data;

		if ( 'openMediaModal' === action && ports && ports[ 0 ] ) {
			const { siteId } = this.props;
			const { allowedTypes, gallery, multiple, value } = payload;

			// set imperatively on the instance because this is not
			// the kind of assignment which causes re-renders and we
			// want it set immediately
			this.mediaSelectPort = ports[ 0 ];

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

		if ( 'trashPost' === action ) {
			const { siteId, editedPostId, postTypeTrashUrl } = this.props;
			this.props.trashPost( siteId, editedPostId );
			this.props.navigate( postTypeTrashUrl );
		}

		if ( 'goToAllPosts' === action ) {
			const { unsavedChanges = false } = payload;
			if ( unsavedChanges ) {
				this.props.markChanged();
			} else {
				this.props.markSaved();
			}
			this.props.navigate( this.props.allPostsUrl );
		}

		if ( 'openRevisions' === action ) {
			if ( ports && ports[ 0 ] ) {
				// set imperatively on the instance because this is not
				// the kind of assignment which causes re-renders and we
				// want it set immediately
				this.revisionsPort = ports[ 0 ];
			}

			this.props.openPostRevisionsDialog();
		}

		if ( 'previewPost' === action ) {
			const { postUrl } = payload;
			this.openPreviewModal( { postUrl, previewPort: ports[ 0 ] } );
		}
	};

	loadRevision = revision => {
		if ( this.revisionsPort ) {
			this.revisionsPort.postMessage( {
				title: revision.post_title,
				excerpt: revision.post_excerpt,
				content: revision.post_content,
			} );

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
				payload: {
					title: revision.post_title,
					excerpt: revision.post_excerpt,
					content: revision.post_content,
				},
			} );
		}
	};

	closeMediaModal = media => {
		if ( ! this.state.classicBlockEditorId && media ) {
			const { multiple } = this.state;
			const formattedMedia = map( media.items, item => mediaCalypsoToGutenberg( item ) );
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

	insertClassicBlockMedia = markup => {
		if ( !! this.state.classicBlockEditorId && this.iframePort ) {
			this.iframePort.postMessage( {
				action: 'insertClassicBlockMedia',
				payload: {
					editorId: this.state.classicBlockEditorId,
					media: markup,
				},
			} );
		}
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
			height: get( action, 'data.height' ),
			status: 'REMOVE_MEDIA_ITEM' === action.type ? 'deleted' : 'updated',
			transientId: get( action, 'id' ),
			url: get( action, 'data.URL' ),
			width: get( action, 'data.width' ),
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
			classicBlockEditorId,
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
					<EditorMediaModal
						disabledDataSources={ getDisabledDataSources( allowedTypes ) }
						enabledFilters={ getEnabledFilters( allowedTypes ) }
						galleryViewEnabled={ false }
						isGutenberg={ ! classicBlockEditorId }
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
		editedPostId: getEditorPostId( state ),
	};
};

const mapDispatchToProps = {
	replaceHistory,
	setRoute,
	navigate,
	openPostRevisionsDialog,
	startEditingPost,
	trashPost,
};

const enhance = flow(
	protectForm,
	connect(
		mapStateToProps,
		mapDispatchToProps
	)
);

export default enhance( CalypsoifyIframe );
