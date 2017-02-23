/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { includes, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import url from 'url';
import Gridicon from 'gridicons';
import { get } from 'lodash';

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
import { userCan } from 'lib/site/utils';
import versionCompare from 'lib/version-compare';
import MediaUtils, { isItemBeingUploaded } from 'lib/media/utils';
import config from 'config';

/**
 * This function return true if the image editor can be
 * enabled/shown
 *
 * @param  {object} site - current site
 * @return {boolean} `true` if the image-editor can be enabled.
 */
const enableImageEditing = ( site ) => {
	// do not show if the feature flag isn't set
	if ( ! config.isEnabled( 'post-editor/image-editor' ) ) {
		return false;
	}

	// do not allow for private sites
	if ( get( site, 'is_private' ) ) {
		return false;
	}

	// do not allow for Jetpack site with a non-valid version
	if (
		get( site, 'jetpack', false ) &&
		versionCompare( get( site, 'options.jetpack_version', '0.0' ), '4.7-alpha', '<' )
	) {
		return false;
	}

	return true;
};

/**
 * This function return true if the video editor can be
 * enabled/shown
 *
 * @param  {object} item - media item
 * @param  {object} site - current site
 * @return {boolean} `true` if the video editor can be enabled.
 */
const enableVideoEditing = ( item, site ) => {
	// do not show if the feature flag isn't set
	if ( ! config.isEnabled( 'post-editor/video-editor' ) ) {
		return false;
	}

	// do not allow for Jetpack site with VideoPress disabled
	if ( get( site, 'jetpack', false ) ) {
		if ( ! MediaUtils.isVideoPressItem( item ) ) {
			return false;
		}
	// do not allow for wpcom site with VideoPress disabled
	} else if ( ! site.options.videopress_enabled ) {
		return false;
	}

	return true;
};

class EditorMediaModalDetailItem extends Component {
	static propTypes = {
		site: PropTypes.object,
		item: PropTypes.object,
		hasPreviousItem: PropTypes.bool,
		hasNextItem: PropTypes.bool,
		onShowPreviousItem: PropTypes.func,
		onShowNextItem: PropTypes.func,
		onEdit: PropTypes.func,
		onRestore: PropTypes.func,
	};

	static defaultProps = {
		hasPreviousItem: false,
		hasNextItem: false,
		onShowPreviousItem: noop,
		onShowNextItem: noop,
		onEdit: noop,
		onRestore: noop,
	};

	renderEditButton() {
		const {
			item,
			onEdit,
			site,
			translate
		} = this.props;

		if ( ! userCan( 'upload_files', site ) ) {
			return null;
		}

		const mimePrefix = MediaUtils.getMimePrefix( item );

		if ( ! includes( [ 'image', 'video' ], mimePrefix ) ) {
			return null;
		}

		let editText = translate( 'Edit Image' );

		if ( 'video' === mimePrefix ) {
			editText = translate( 'Edit Thumbnail' );
		}

		return (
			<Button
				className="editor-media-modal-detail__edit"
				onClick={ onEdit }
				disabled={ isItemBeingUploaded( item ) }
			>
				<Gridicon icon="pencil" size={ 36 } /> { editText }
			</Button>
		);
	}

	handleOnRestoreClick = () => {
		const { site, item, onRestore } = this.props;
		onRestore( site && site.ID, item );
	};

	renderRestoreButton() {
		const {
			item,
			translate
		} = this.props;

		//do a simple guid vs url check
		const guidParts = url.parse( item.guid );
		const URLParts = url.parse( item.URL );

		if ( guidParts.pathname === URLParts.pathname ) {
			return false;
		}

		return (
			<Button
				className={ classNames(
					'editor-media-modal-detail__restore',
				) }
				onClick={ this.handleOnRestoreClick }
				disabled={ isItemBeingUploaded( item ) }
			>
				<Gridicon
					icon="refresh"
					size={ 36 } />
					{ translate( 'Restore Original' ) }
			</Button>
		);
	}

	renderMediaEditorButtons( item, classname = 'is-desktop' ) {
		if ( ! item ) {
			return null;
		}

		const mimePrefix = MediaUtils.getMimePrefix( item );
		const classes = classNames( 'editor-media-modal-detail__edition-bar', classname );

		if ( 'video' === mimePrefix ) {
			return this.renderVideoEditorButtons( item, classes );
		}

		return this.renderImageEditorButtons( classes, classname );
	}

	renderImageEditorButtons( classes, classname ) {
		const { site } = this.props;

		if ( ! enableImageEditing( site ) ) {
			return null;
		}

		return (
			<div className={ classes }>
				{ this.renderRestoreButton( classname ) }
				{ this.renderEditButton() }
			</div>
		);
	}

	renderVideoEditorButtons( item, classes ) {
		const { site } = this.props;

		if ( ! enableVideoEditing( item, site ) ) {
			return null;
		}

		return (
			<div className={ classes }>
				{ this.renderEditButton() }
			</div>
		);
	}

	renderFields() {
		const { site, item } = this.props;

		if ( ! userCan( 'upload_files', site ) ) {
			return null;
		}

		return (
			<EditorMediaModalDetailFields
				site={ site }
				item={ item } />
		);
	}

	renderPreviousItemButton() {
		const {
			hasPreviousItem,
			onShowPreviousItem,
			translate
		} = this.props;

		if ( ! hasPreviousItem ) {
			return null;
		}

		return (
			<button
				onClick={ onShowPreviousItem }
				className="editor-media-modal-detail__previous">
				<Gridicon icon="chevron-left" size={ 36 } />
				<span className="screen-reader-text">
					{ translate( 'Previous' ) }
				</span>
			</button>
		);
	}

	renderNextItemButton() {
		const {
			hasNextItem,
			onShowNextItem,
			translate
		} = this.props;

		if ( ! hasNextItem ) {
			return null;
		}

		return (
			<button
				onClick={ onShowNextItem }
				className="editor-media-modal-detail__next">
				<Gridicon icon="chevron-right" size={ 36 } />
				<span className="screen-reader-text">
					{ translate( 'Next' ) }
				</span>
			</button>
		);
	}

	renderItem() {
		const {
			item,
			site
		} = this.props;

		if ( ! item ) {
			return null;
		}

		const mimePrefix = MediaUtils.getMimePrefix( item );

		let Item;

		switch ( mimePrefix ) {
			case 'image': Item = EditorMediaModalDetailPreviewImage; break;
			case 'video': Item = EditorMediaModalDetailPreviewVideo; break;
			case 'audio': Item = EditorMediaModalDetailPreviewAudio; break;
			default: Item = EditorMediaModalDetailPreviewDocument; break;
		}

		return React.createElement( Item, {
			site: site,
			item: item
		} );
	}

	render() {
		const { item } = this.props;

		const classes = classNames( 'editor-media-modal-detail__item', {
			'is-loading': ! item
		} );

		return (
			<figure className={ classes }>
				<div className="editor-media-modal-detail__content editor-media-modal__content">

					<div className="editor-media-modal-detail__preview-wrapper">
						{ this.renderItem() }
						{ this.renderMediaEditorButtons( item ) }
						{ this.renderPreviousItemButton() }
						{ this.renderNextItemButton() }
					</div>

					<div className="editor-media-modal-detail__sidebar">
						{ this.renderMediaEditorButtons( item, 'is-mobile' ) }
						{ this.renderFields() }
						<EditorMediaModalDetailFileInfo
							item={ item } />
					</div>

				</div>
			</figure>
		);
	}
}

export default localize( EditorMediaModalDetailItem );
