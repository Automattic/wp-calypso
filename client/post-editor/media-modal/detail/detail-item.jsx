/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import noop from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import EditorMediaModalDetailFields from './detail-fields';
import EditorMediaModalDetailFileInfo from './detail-file-info';
import EditorMediaModalDetailPreviewImage from './detail-preview-image';
import EditorMediaModalDetailPreviewVideo from './detail-preview-video';
import EditorMediaModalDetailPreviewAudio from './detail-preview-audio';
import EditorMediaModalDetailPreviewDocument from './detail-preview-document';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import { userCan } from 'lib/site/utils';
import MediaUtils from 'lib/media/utils';
import config from 'config';

const debug = debugFactory( 'calypso:post-editor:media:detail-item' );

const renderFields = ( { item, site } ) => {
	if ( ! userCan( 'upload_files', site ) ) {
		return;
	}

	return (
		<EditorMediaModalDetailFields
			site={ site }
			item={ item } />
	);
};

const renderEditButton = ( { item, onEdit, site, translate } ) => {
	// Do not render edit button for private sites
	if ( site.is_private ) {
		return debug( 'Do not show `Edit button` for private sites' );
	}

	if (
		! config.isEnabled( 'post-editor/image-editor' ) ||
		! userCan( 'upload_files', site ) ||
		! item
	) {
		return;
	}

	const mimePrefix = MediaUtils.getMimePrefix( item );

	if ( 'image' !== mimePrefix ) {
		return;
	}

	return (
		<Button
			className="is-desktop editor-media-modal-detail__edit"
			onClick={ onEdit }>
			<Gridicon icon="pencil" size={ 36 } /> { translate( 'Edit Image' ) }
		</Button>
	);
};

const renderNextItemButton = ( { hasNextItem, onShowNextItem, translate } ) => {
	if ( ! hasNextItem ) {
		return;
	}

	return (
		<button
			onClick={ onShowNextItem }
			className="editor-media-modal-detail__next"
		>
			<Gridicon icon="chevron-right" size={ 36 } />
			<span className="screen-reader-text">
				{ translate( 'Next' ) }
			</span>
		</button>
	);
};

const renderPreviousItemButton = ( { hasPreviousItem, onShowPreviousItem, translate } ) => {
	if ( ! hasPreviousItem ) {
		return;
	}

	return (
		<button
			onClick={ onShowPreviousItem }
			className="editor-media-modal-detail__previous"
		>
			<Gridicon icon="chevron-left" size={ 36 } />
			<span className="screen-reader-text">
				{ translate( 'Previous' ) }
			</span>
		</button>
	);
};

const renderItem = ( { item, site } ) => {
	if ( ! item ) {
		return;
	}

	const mimePrefix = MediaUtils.getMimePrefix( item );
	let componentElement;

	switch ( mimePrefix ) {
		case 'image': componentElement = EditorMediaModalDetailPreviewImage; break;
		case 'video': componentElement = EditorMediaModalDetailPreviewVideo; break;
		case 'audio': componentElement = EditorMediaModalDetailPreviewAudio; break;
		default: componentElement = EditorMediaModalDetailPreviewDocument; break;
	}

	return React.createElement( componentElement, {
		site: site,
		item: item
	} );
};

const EditorMediaModalDetailItem = ( props ) => {
	const { item } = props;

	const classes = classNames(
		'editor-media-modal-detail__item',
		{ 'is-loading': ! item } );

	return (
		<figure className={ classes }>
			<div className="editor-media-modal-detail__content editor-media-modal__content">
				<div className="editor-media-modal-detail__preview-wrapper">
					{ renderItem( props ) }
					{ renderPreviousItemButton( props ) }
					{ renderNextItemButton( props ) }
				</div>
				<div className="editor-media-modal-detail__sidebar">
					{ renderEditButton( props ) }
					{ renderFields( props ) }
					<EditorMediaModalDetailFileInfo
						item={ item } />
				</div>
			</div>
		</figure>
	);
};

EditorMediaModalDetailItem.propTypes = {
	site: PropTypes.object,
	item: PropTypes.object,
	hasPreviousItem: PropTypes.bool,
	hasNextItem: PropTypes.bool,
	onShowPreviousItem: PropTypes.func,
	onShowNextItem: PropTypes.func,
	onEdit: PropTypes.func
};

EditorMediaModalDetailItem.defaultProps = {
	hasPreviousItem: false,
	hasNextItem: false,
	onShowPreviousItem: noop,
	onShowNextItem: noop,
	onEdit: noop,
};

export default localize( EditorMediaModalDetailItem );

