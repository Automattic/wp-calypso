/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { map, pickBy, endsWith } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaModal from 'post-editor/media-modal';
import MediaActions from 'lib/media/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteOption, getSiteAdminUrl, getSiteSlug } from 'state/sites/selectors';
import { addQueryArgs } from 'lib/route';
import {
	getEnabledFilters,
	getDisabledDataSources,
	mediaCalypsoToGutenberg,
} from './hooks/components/media-upload/utils';
import { replaceHistory, setRoute, navigate } from 'state/ui/actions';
import getCurrentRoute from 'state/selectors/get-current-route';
import getPostTypeTrashUrl from 'state/selectors/get-post-type-trash-url';
import getPostTypeAllPostsUrl from 'state/selectors/get-post-type-all-posts-url';
import wpcom from 'lib/wp';
import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';
import { openPostRevisionsDialog } from 'state/posts/revisions/actions';
import { startEditingPost } from 'state/ui/editor/actions';
import { Placeholder } from './placeholder';
import { trashPost } from 'state/posts/actions';

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
	};

	constructor( props ) {
		super( props );
		this.iframeRef = React.createRef();
	}

	componentDidMount() {
		window.addEventListener( 'message', this.onMessage, false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.onMessage, false );
	}

	onMessage = ( { data, origin } ) => {
		if ( ! data || origin.indexOf( this.props.siteSlug ) < 0 ) {
			return;
		}

		const { action, type } = data;

		if ( 'gutenbergIframeMessage' !== type ) {
			return;
		}

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

	onIframePortMessage = ( { data } ) => {
		const { action, payload } = data;

		if ( 'openMediaModal' === action ) {
			const { siteId } = this.props;
			const { allowedTypes, gallery, multiple, value } = payload;

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
			const { siteId, postId, postTypeTrashUrl } = this.props;
			this.props.trashPost( siteId, postId );
			this.props.navigate( postTypeTrashUrl );
		}

		if ( 'goToAllPosts' === action ) {
			this.props.navigate( this.props.allPostsUrl );
		}

		if ( 'openRevisions' === action ) {
			this.props.openPostRevisionsDialog();
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

			this.iframePort.postMessage( {
				action: 'selectMedia',
				payload,
			} );
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

	render() {
		const { iframeUrl, siteId } = this.props;
		const { isMediaModalVisible, allowedTypes, multiple, isIframeLoaded } = this.state;

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
			</Fragment>
		);
	}
}

const mapStateToProps = ( state, { postId, postType, duplicatePostId } ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	const currentRoute = getCurrentRoute( state );
	const postTypeTrashUrl = getPostTypeTrashUrl( state, postType );

	let queryArgs = pickBy( {
		post: postId,
		action: postId && 'edit', // If postId is set, open edit view.
		post_type: postType !== 'post' && postType, // Use postType if it's different than post.
		calypsoify: 1,
		'block-editor': 1,
		'frame-nonce': getSiteOption( state, siteId, 'frame_nonce' ) || '',
		'jetpack-copy': duplicatePostId,
		origin: window.location.origin,
	} );

	// needed for loading the editor in SU sessions
	if ( wpcom.addSupportParams ) {
		queryArgs = wpcom.addSupportParams( queryArgs );
	}

	const iframeUrl = addQueryArgs(
		queryArgs,
		getSiteAdminUrl( state, siteId, postId ? 'post.php' : 'post-new.php' )
	);

	return {
		allPostsUrl: getPostTypeAllPostsUrl( state, postType ),
		siteId,
		siteSlug,
		currentRoute,
		iframeUrl,
		postTypeTrashUrl,
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

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( CalypsoifyIframe );
