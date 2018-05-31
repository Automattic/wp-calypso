/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import MediaLibraryListItem from 'my-sites/media-library/list-item';
import EditorMediaModalGalleryCaption from './caption';
import EditorMediaModalGalleryRemoveButton from './remove-button';
import canCurrentUser from 'state/selectors/can-current-user';

class EditorMediaModalGalleryEditItem extends Component {
	static propTypes = {
		site: PropTypes.object,
		item: PropTypes.object,
		showRemoveButton: PropTypes.bool,
		selected: PropTypes.bool,
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
		const { site, item, selected, showRemoveButton } = this.props;

		const className = classNames(
			'editor-media-modal-gallery__edit-item',
			selected && 'editor-media-modal-gallery__edit-item--selected'
		);

		return (
			<div
				className={ className }
				onClick={ this.onClick }
				onKeyUp={ this.onKeyUp }
				tabIndex="0"
				role="button"
			>
				<MediaLibraryListItem
					media={ item }
					scale={ 1 }
					photon={ false }
					onClick={ this.onClick }
				/>
				{ this.renderCaption() }
				{ showRemoveButton && (
					<EditorMediaModalGalleryRemoveButton siteId={ site.ID } itemId={ item.ID } />
				) }
			</div>
		);
	}

	onSelect = () => {
		const { item, onSelect } = this.props;
		onSelect( item.ID );
	};

	onClick = e => {
		const { selected } = this.props;

		if ( selected && 'INPUT' === e.target.tagName ) {
			return;
		}

		this.onSelect();
	};

	onKeyUp = e => {
		if ( 'Enter' === e.key ) {
			this.onSelect();
		}
	};
}

export default connect( ( state, { site = {} } ) => {
	const canUserUploadFiles = canCurrentUser( state, site.ID, 'upload_files' );

	return {
		canUserUploadFiles,
	};
} )( EditorMediaModalGalleryEditItem );
