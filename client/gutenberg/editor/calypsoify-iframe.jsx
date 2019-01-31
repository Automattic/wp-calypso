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

const parseJSON = data => {
	try {
		return JSON.parse( data );
	} catch {
		return;
	}
};

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

	onMessage = ( { data, origin, ports } ) => {
		const message = parseJSON( data );
		if ( ! message || origin.indexOf( this.props.siteSlug ) < 0 ) {
			return;
		}

		const { action, type, payload } = message;

		if ( 'gutenbergIframeMessage' !== type ) {
			return;
		}

		if ( 'openMediaModal' === action && ports[ 0 ] ) {
			this.messageChannelPort = ports[ 0 ];

			const { gallery, multiple, allowedTypes } = payload;
			this.setState( { isMediaModalVisible: true, gallery, multiple, allowedTypes } );
		}
	};

	closeMediaModal = media => {
		if ( media && this.messageChannelPort ) {
			const { multiple } = this.state;
			const formattedMedia = map( media.items, item => mediaCalypsoToGutenberg( item ) );
			const payload = multiple ? formattedMedia : formattedMedia[ 0 ];

			this.messageChannelPort.postMessage( {
				action: 'selectMedia',
				payload,
			} );
		}

		this.setState( { isMediaModalVisible: false } );
	};

	render() {
		const { iframeUrl, siteId } = this.props;
		const { isMediaModalVisible, multiple, allowedTypes } = this.state;

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
