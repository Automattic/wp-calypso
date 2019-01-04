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
import MediaActions from 'lib/media/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { mediaCalypsoToGutenberg } from './utils';

export class MediaUpload extends Component {
	state = {
		isModalVisible: false,
	};

	componentDidMount() {
		MediaActions.setLibrarySelectedItems( this.props.siteId, this.getSelectedItems() );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.value !== this.props.value ) {
			MediaActions.setLibrarySelectedItems( this.props.siteId, this.getSelectedItems() );
		}
	}

	closeModal = () => {
		const { onClose } = this.props;
		this.setState( { isModalVisible: false } );
		if ( onClose ) {
			onClose();
		}
	};

	openModal = () => {
		if ( ! this.state.isModalVisible ) {
			this.setState( { isModalVisible: true } );
		}
	};

	insertMedia = media => {
		const { multiple, onSelect } = this.props;
		const formattedMedia = map( media.items, item => mediaCalypsoToGutenberg( item ) );
		if ( multiple ) {
			onSelect( formattedMedia );
		} else {
			onSelect( formattedMedia[ 0 ] );
		}
	};

	onCloseModal = media => {
		if ( media ) {
			this.insertMedia( media );
		}
		this.closeModal();
	};

	getDisabledDataSources = () => {
		const { allowedTypes } = this.props;
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

	getSelectedItems = () => {
		const { value } = this.props;
		if ( ! value ) {
			return [];
		}
		if ( isArray( value ) ) {
			return map( this.props.value, item => ( { ID: parseInt( item, 10 ) } ) );
		}
		return [ { ID: parseInt( value, 10 ) } ];
	};

	render() {
		const { multiple, render, siteId } = this.props;
		const { isModalVisible } = this.state;

		return (
			<Fragment>
				{ render( { open: this.openModal } ) }
				<MediaLibrarySelectedData siteId={ siteId }>
					<MediaModal
						disabledDataSources={ this.getDisabledDataSources() }
						enabledFilters={ this.getEnabledFilters() }
						galleryViewEnabled={ false }
						onClose={ this.onCloseModal }
						single={ ! multiple }
						source=""
						visible={ isModalVisible }
					/>
				</MediaLibrarySelectedData>
			</Fragment>
		);
	}
}

const mapStateToProps = state => ( {
	siteId: getSelectedSiteId( state ),
} );

export default connect( mapStateToProps )( MediaUpload );
