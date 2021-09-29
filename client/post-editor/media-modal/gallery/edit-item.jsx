import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import MediaLibraryListItem from 'calypso/my-sites/media-library/list-item';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import EditorMediaModalGalleryCaption from './caption';
import EditorMediaModalGalleryRemoveButton from './remove-button';

class EditorMediaModalGalleryEditItem extends Component {
	static propTypes = {
		site: PropTypes.object,
		item: PropTypes.object,
		showRemoveButton: PropTypes.bool,
	};

	static defaultProps = {
		showRemoveButton: true,
	};

	renderCaption = () => {
		const { site, item, canUserUploadFiles } = this.props;
		if ( ! canUserUploadFiles ) {
			return;
		}

		return <EditorMediaModalGalleryCaption siteId={ site.ID } item={ item } />;
	};

	render() {
		const { site, item, showRemoveButton } = this.props;

		return (
			<div className="editor-media-modal-gallery__edit-item">
				<MediaLibraryListItem media={ item } scale={ 1 } photon={ false } />
				{ this.renderCaption() }
				{ showRemoveButton && (
					<EditorMediaModalGalleryRemoveButton siteId={ site.ID } itemId={ item.ID } />
				) }
			</div>
		);
	}
}

export default connect( ( state, { site = {} } ) => {
	const canUserUploadFiles = canCurrentUser( state, site.ID, 'upload_files' );

	return {
		canUserUploadFiles,
	};
} )( EditorMediaModalGalleryEditItem );
