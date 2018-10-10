/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaModal from 'post-editor/media-modal';
import { getSelectedSiteId } from 'state/ui/selectors';
import { mediaCalypsoToGutenberg } from './utils';

export class MediaUpload extends Component {
	state = {
		isModalVisible: false,
	};

	closeModal = () => this.setState( { isModalVisible: false } );

	openModal = () => this.setState( { isModalVisible: true } );

	insertMedia = media => {
		const { onSelect } = this.props;
		const formattedMedia = mediaCalypsoToGutenberg( media.items[ 0 ] );
		onSelect( formattedMedia );
	};

	onCloseModal = media => {
		if ( media ) {
			this.insertMedia( media );
		}
		this.closeModal();
	};

	render() {
		const { render, siteId } = this.props;
		const { isModalVisible } = this.state;

		return (
			<Fragment>
				{ render( { open: this.openModal } ) }
				<MediaLibrarySelectedData siteId={ siteId }>
					<MediaModal onClose={ this.onCloseModal } visible={ isModalVisible } source="" />
				</MediaLibrarySelectedData>
			</Fragment>
		);
	}
}

const mapStateToProps = state => ( {
	siteId: getSelectedSiteId( state ),
} );

export default connect( mapStateToProps )( MediaUpload );
