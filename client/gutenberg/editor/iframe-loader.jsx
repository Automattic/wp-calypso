/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { includes, isArray, map } from 'lodash';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaModal from 'post-editor/media-modal';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteAdminUrl } from 'state/sites/selectors';
import { mediaCalypsoToGutenberg } from './hooks/components/media-upload/utils';

const sendMessage = (iframe, message ) => {
	iframe.contentWindow.postMessage(
		JSON.stringify( {
			...message,
			type: 'gutenbergIframeMessage',
		} ),
		'*'
	);
};

class Calypsoified extends Component {
	state = {
		isModalVisible: false,
	};

	constructor( props ) {
		super( props );

		this.iframe = null;
	}

	componentDidMount() {
		window.addEventListener( 'message', this.onMessage, false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.onMessage, false );
	}

	setIframeRef = element => {
		this.iframe = element;
	};

	onMessage = ( { data } ) => {
		if ( typeof data !== 'string' || data[ 0 ] !== '{' ) {
			return;
		}
		const message = JSON.parse( data );
		const { action, type, payload } = message;

		if( type !== 'gutenbergIframeMessage' ) {
			return;
		}

		if( action === 'openModal') {
			const { gallery, multiple, allowedTypes } = payload;
			this.setState( { isModalVisible: true, gallery, multiple, allowedTypes } )
		}
	}

	openModal = () => {
		if ( ! this.state.isModalVisible ) {
			this.setState( { isModalVisible: true } );
		}
	};

	closeModal = media => {
		if( media ) {
			const { multiple } = this.state;
			const formattedMedia = map( media.items, item => mediaCalypsoToGutenberg( item ) );
			const payload = multiple ? formattedMedia : formattedMedia[ 0 ];

			sendMessage( this.iframe, {
				action: 'selectMedia',
				payload
			} );
		}

		this.setState( { isModalVisible: false } );
	};

	getDisabledDataSources = () => {
		const { allowedTypes } = this.state;
		// Additional data sources are enabled for all blocks supporting images.
		// The File block supports images, but doesn't explicitly allow any media type:
		// its `allowedTypes` prop can be either undefined or an empty array.
		if (
			! allowedTypes ||
			( isArray( allowedTypes ) && ! allowedTypes.length ) ||
			includes( allowedTypes, 'image' )
		) {
			return [];
		}
		return [ 'google_photos', 'pexels' ];
	};

	getEnabledFilters = () => {
		const { allowedTypes } = this.props;

		const enabledFiltersMap = {
			image: 'images',
			audio: 'audio',
			video: 'videos',
		};

		return isArray( allowedTypes ) && allowedTypes.length
			? allowedTypes.map( type => enabledFiltersMap[ type ] )
			: undefined;
	};

	render() {
		const { iframeUrl, siteId } = this.props;
		const { isModalVisible, multiple } = this.state;

		return (
			<Fragment>
				<div className="main main-column customize is-iframe" role="main">
					<iframe ref={ this.setIframeRef } className={ 'is-iframe-loaded' } src={ iframeUrl } />
				</div>
				<MediaLibrarySelectedData siteId={ siteId }>
					<MediaModal
						disabledDataSources={ this.getDisabledDataSources() }
						enabledFilters={ this.getEnabledFilters() }
						galleryViewEnabled={ false }
						onClose={ this.closeModal }
						single={ ! multiple }
						source=""
						visible={ isModalVisible }
					/>
				</MediaLibrarySelectedData>
			</Fragment>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			iframeUrl: getSiteAdminUrl( state, siteId, 'post-new.php' )
		}
	}
)( Calypsoified );
