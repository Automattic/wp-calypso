/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { userCan } from 'lib/site/utils';
import MediaLibraryListItem from 'my-sites/media-library/list-item';
import EditorMediaModalGalleryCaption from './caption';
import EditorMediaModalGalleryRemoveButton from './remove-button';

export default class extends React.Component {
	static displayName = 'EditorMediaModalGalleryEditItem';

	static propTypes = {
		site: PropTypes.object,
		item: PropTypes.object,
		showRemoveButton: PropTypes.bool,
	};

	static defaultProps = {
		showRemoveButton: true,
	};

	renderCaption = () => {
		const { site, item } = this.props;
		if ( ! userCan( 'upload_files', site ) ) {
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
