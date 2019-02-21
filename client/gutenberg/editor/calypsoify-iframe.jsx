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
import wpcom from 'lib/wp';

/**
 * Style dependencies
 */
import './style.scss';

class CalypsoifyIframe extends Component {
	static propTypes = {
		postId: PropTypes.number,
		postType: PropTypes.string,
		duplicatePostId: PropTypes.number,
	};

	state = {
		isMediaModalVisible: false,
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

			//once the iframe is loaded and the port exchanged, we no longer need to listen for message
			window.removeEventListener( 'message', this.onMessage, false );
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
			const { currentRoute } = this.props;

			if ( ! endsWith( currentRoute, `/${ postId }` ) ) {
				this.props.replaceHistory( `${ currentRoute }/${ postId }`, true );
				this.props.setRoute( `${ currentRoute }/${ postId }` );
			}
		}

		if ( 'postTrashed' === action ) {
			this.props.navigate( this.props.postTypeTrashUrl );
		}
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

	render() {
		const { iframeUrl, siteId } = this.props;
		const { isMediaModalVisible, allowedTypes, multiple } = this.state;

		return (
			<Fragment>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<div className="main main-column calypsoify is-iframe" role="main">
					{ /* eslint-disable-next-line jsx-a11y/iframe-has-title, wpcalypso/jsx-classname-namespace */ }
					<iframe ref={ this.iframeRef } className={ 'is-iframe-loaded' } src={ iframeUrl } />
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
		force_gutenberg: 1,
		'frame-nonce': getSiteOption( state, siteId, 'frame_nonce' ) || '',
		'jetpack-copy': duplicatePostId,
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
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( CalypsoifyIframe );
