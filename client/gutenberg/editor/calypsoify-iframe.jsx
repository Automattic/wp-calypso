/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { map, pickBy } from 'lodash';

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

/**
 * Style dependencies
 */
import './style.scss';

class CalypsoifyIframe extends Component {
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
			this.iframePort.addEventListener( 'message', this.oniFramePortMessage, false );
			this.iframePort.start();

			this.iframeRef.current.contentWindow.postMessage( { action: 'initPort' }, '*', [
				portForIframe,
			] );

			//once the iframe is loaded and the port exchanged, we no longer need to listen for message
			window.removeEventListener( 'message', this.onMessage, false );
		}
	};

	oniFramePortMessage = ( { data } ) => {
		const { action, payload } = data;

		if ( 'openMediaModal' === action ) {
			const { siteId } = this.props;
			const { allowedTypes, gallery, multiple, value } = payload;

			this.setState( { isMediaModalVisible: true, allowedTypes, gallery, multiple } );

			if ( ! value ) {
				MediaActions.setLibrarySelectedItems( siteId, [] );
				return;
			}

			const selectedItems = Array.isArray( value )
				? map( value, item => ( { ID: parseInt( item, 10 ) } ) )
				: [ { ID: parseInt( value, 10 ) } ];
			MediaActions.setLibrarySelectedItems( siteId, selectedItems );
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

export default connect( ( state, { postId, postType } ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );

	const iframeUrl = addQueryArgs(
		pickBy( {
			post: postId,
			action: postId && 'edit', // If postId is set, open edit view.
			post_type: postType !== 'post' && postType, // Use postType if it's different than post.
			calypsoify: 1,
			'frame-nonce': getSiteOption( state, siteId, 'frame_nonce' ) || '',
		} ),
		getSiteAdminUrl( state, siteId, postId ? 'post.php' : 'post-new.php' )
	);

	return {
		siteId,
		siteSlug,
		iframeUrl,
	};
} )( CalypsoifyIframe );
