/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { isArray, map } from 'lodash';

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

	closeModal = () => this.setState( { isModalVisible: false } );

	openModal = () => this.setState( { isModalVisible: true } );

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

	getEnabledFilters = () => {
		// TODO: Replace with `allowedTypes` (array) after updating Gutenberg
		const { type } = this.props;
		switch ( type ) {
			case 'image':
				return [ 'images' ];
			case 'audio':
				return [ 'audio' ];
			case 'video':
				return [ 'videos' ];
			case 'document':
				return [ 'documents' ];
		}
		return undefined;
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
