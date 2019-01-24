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
import { getSiteOption, getSiteAdminUrl } from 'state/sites/selectors';
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

const sendMessage = ( iframe, message ) => {
	if ( ! iframe || ! iframe.contentWindow ) {
		return;
	}

	iframe.contentWindow.postMessage(
		JSON.stringify( {
			...message,
			type: 'gutenbergIframeMessage',
		} ),
		'*'
	);
};

class CalypsoifyIframe extends Component {
	state = {
		isMediaModalVisible: false,
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

		if ( type !== 'gutenbergIframeMessage' ) {
			return;
		}

		if ( action === 'openMediaModal' ) {
			const { gallery, multiple, allowedTypes } = payload;
			this.setState( { isMediaModalVisible: true, gallery, multiple, allowedTypes } );
		}
	};

	openMediaModal = () => {
		if ( ! this.state.isMediaModalVisible ) {
			this.setState( { isMediaModalVisible: true } );
		}
	};

	closeMediaModal = media => {
		if ( media ) {
			const { multiple } = this.state;
			const formattedMedia = map( media.items, item => mediaCalypsoToGutenberg( item ) );
			const payload = multiple ? formattedMedia : formattedMedia[ 0 ];

			sendMessage( this.iframe, {
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
					<iframe ref={ this.setIframeRef } className={ 'is-iframe-loaded' } src={ iframeUrl } />
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

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const postId = ownProps.postId;
	const postType = ownProps.postType;

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
		iframeUrl,
	};
} )( CalypsoifyIframe );
