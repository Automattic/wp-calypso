/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import url from 'url';

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
import { userCan, isJetpack } from 'lib/site/utils';
import MediaUtils, { isItemBeingUploaded } from 'lib/media/utils';
import config from 'config';

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

		if ( 'image' !== mimePrefix ) {
			return null;
		}

		return (
			<Button
				className="media-modal-detail__edit"
				onClick={ onEdit }
				disabled={ isItemBeingUploaded( item ) }
			>
				<Gridicon icon="pencil" size={ 36 } /> { translate( 'Edit Image' ) }
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
					'media-modal-detail__restore',
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

	renderImageEditorButtons( item, classname = 'is-desktop' ) {
		const { site } = this.props;

		if (
			site.is_private ||
			! config.isEnabled( 'post-editor/image-editor' ) ||
			isJetpack( site ) ||
			! item
		) {
			return null;
		}

		const classes = classNames( 'media-modal-detail__edition-bar', classname );

		return (
			<div className={ classes }>
				{ this.renderRestoreButton( classname ) }
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
				className="media-modal-detail__previous">
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
				className="media-modal-detail__next">
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

		const classes = classNames( 'media-modal-detail__item', {
			'is-loading': ! item
		} );

		return (
			<figure className={ classes }>
				<div className="media-modal-detail__content media-modal__content">

					<div className="media-modal-detail__preview-wrapper">
						{ this.renderItem() }
						{ this.renderImageEditorButtons( item ) }
						{ this.renderPreviousItemButton() }
						{ this.renderNextItemButton() }
					</div>

					<div className="media-modal-detail__sidebar">
						{ this.renderImageEditorButtons( item, 'is-mobile' ) }
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
