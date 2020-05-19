/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { flowRight, get, includes, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import url from 'url';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import EditorMediaModalContent from '../content';
import EditorMediaModalDetailFields from './detail-fields';
import EditorMediaModalDetailFileInfo from './detail-file-info';
import EditorMediaModalDetailPreviewImage from './detail-preview-image';
import EditorMediaModalDetailPreviewVideo from './detail-preview-video';
import EditorMediaModalDetailPreviewAudio from './detail-preview-audio';
import EditorMediaModalDetailPreviewDocument from './detail-preview-document';
import { Button, ScreenReaderText } from '@automattic/components';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import versionCompare from 'lib/version-compare';
import { getMimePrefix, isItemBeingUploaded, isVideoPressItem } from 'lib/media/utils';
import config from 'config';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteOption, isJetpackModuleActive, isJetpackSite } from 'state/sites/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import isPrivateSite from 'state/selectors/is-private-site';

export class EditorMediaModalDetailItem extends Component {
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

	/**
	 * This function returns true if the video editor can be enabled/shown.
	 *
	 * @param  {object}  item Media item
	 * @returns {boolean} Whether the video editor can be enabled
	 */
	shouldShowVideoEditingButtons( item ) {
		const { isJetpack, isVideoPressEnabled, isVideoPressModuleActive } = this.props;

		// Not a VideoPress video
		if ( ! isVideoPressItem( item ) ) {
			return false;
		}

		// Jetpack and VideoPress disabled
		if ( isJetpack ) {
			if ( ! isVideoPressModuleActive ) {
				return false;
			}
			// WP.com and VideoPress disabled
		} else if ( ! isVideoPressEnabled ) {
			return false;
		}

		return true;
	}

	/**
	 * This function returns true if the image editor can be
	 * enabled/shown
	 *
	 * @param  {object} item - media item
	 * @param  {object} site - current site
	 * @returns {boolean} `true` if the image-editor can be enabled.
	 */
	shouldShowImageEditingButtons( item, site ) {
		const { isSitePrivate } = this.props;

		// do not allow if, for some reason, there isn't a valid item yet
		if ( ! item ) {
			return false;
		}

		// do not show if the feature flag isn't set
		if ( ! config.isEnabled( 'post-editor/image-editor' ) ) {
			return false;
		}

		// do not allow for private sites
		if ( isSitePrivate ) {
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
	}

	renderEditButton() {
		const { item, onEdit, translate, canUserUploadFiles } = this.props;

		if ( ! canUserUploadFiles ) {
			return null;
		}

		const mimePrefix = getMimePrefix( item );

		if ( ! includes( [ 'image', 'video' ], mimePrefix ) ) {
			return null;
		}

		const editText =
			'video' === mimePrefix ? translate( 'Edit Thumbnail' ) : translate( 'Edit Image' );

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
		const { item, translate } = this.props;

		//do a simple guid vs url check
		const guidParts = url.parse( item.guid );
		const URLParts = url.parse( item.URL );

		if ( guidParts.pathname === URLParts.pathname ) {
			return false;
		}

		return (
			<Button
				className={ classNames( 'editor-media-modal-detail__restore' ) }
				onClick={ this.handleOnRestoreClick }
				disabled={ isItemBeingUploaded( item ) }
			>
				<Gridicon icon="refresh" size={ 36 } />
				{ translate( 'Restore Original' ) }
			</Button>
		);
	}

	renderMediaEditorButtons( item, classname = 'is-desktop' ) {
		if ( ! item ) {
			return null;
		}

		const mimePrefix = getMimePrefix( item );

		return 'video' === mimePrefix
			? this.renderVideoEditorButtons( item, classname )
			: this.renderImageEditorButtons( classname );
	}

	renderImageEditorButtons( classname ) {
		const { item, site } = this.props;

		if ( ! this.shouldShowImageEditingButtons( item, site ) ) {
			return null;
		}

		const classes = classNames( 'editor-media-modal-detail__edition-bar', classname );

		return (
			<div className={ classes }>
				{ this.renderRestoreButton( classname ) }
				{ this.renderEditButton() }
			</div>
		);
	}

	renderVideoEditorButtons( item, classname ) {
		if ( ! this.shouldShowVideoEditingButtons( item ) ) {
			return null;
		}

		const classes = classNames( 'editor-media-modal-detail__edition-bar', classname );

		return <div className={ classes }>{ this.renderEditButton() }</div>;
	}

	renderFields() {
		const { site, item, canUserUploadFiles } = this.props;

		if ( ! canUserUploadFiles ) {
			return null;
		}

		return <EditorMediaModalDetailFields site={ site } item={ item } />;
	}

	renderPreviousItemButton() {
		const { hasPreviousItem, onShowPreviousItem, translate } = this.props;

		if ( ! hasPreviousItem ) {
			return null;
		}

		return (
			<button onClick={ onShowPreviousItem } className="editor-media-modal-detail__previous">
				<Gridicon icon="chevron-left" size={ 36 } />
				<ScreenReaderText>{ translate( 'Previous' ) }</ScreenReaderText>
			</button>
		);
	}

	renderNextItemButton() {
		const { hasNextItem, onShowNextItem, translate } = this.props;

		if ( ! hasNextItem ) {
			return null;
		}

		return (
			<button onClick={ onShowNextItem } className="editor-media-modal-detail__next">
				<Gridicon icon="chevron-right" size={ 36 } />
				<ScreenReaderText>{ translate( 'Next' ) }</ScreenReaderText>
			</button>
		);
	}

	renderItem() {
		const { item, site } = this.props;

		if ( ! item ) {
			return null;
		}

		const mimePrefix = getMimePrefix( item );

		let Item;

		switch ( mimePrefix ) {
			case 'image':
				Item = EditorMediaModalDetailPreviewImage;
				break;
			case 'video':
				Item = EditorMediaModalDetailPreviewVideo;
				break;
			case 'audio':
				Item = EditorMediaModalDetailPreviewAudio;
				break;
			default:
				Item = EditorMediaModalDetailPreviewDocument;
				break;
		}

		return React.createElement( Item, {
			className: 'editor-media-modal-detail__preview',
			site: site,
			item: item,
		} );
	}

	render() {
		const { isJetpack, item, siteId } = this.props;

		const classes = classNames( 'editor-media-modal-detail__item', {
			'is-loading': ! item,
		} );

		return (
			<figure className={ classes }>
				<EditorMediaModalContent className="editor-media-modal-detail__content">
					<div className="editor-media-modal-detail__preview-wrapper">
						{ this.renderItem() }
						{ this.renderMediaEditorButtons( item ) }
						{ this.renderPreviousItemButton() }
						{ this.renderNextItemButton() }
					</div>

					<div className="editor-media-modal-detail__sidebar">
						{
							isJetpack && (
								<QueryJetpackModules siteId={ siteId } />
							) /* Is the VideoPress module active? */
						}
						{ this.renderMediaEditorButtons( item, 'is-mobile' ) }
						{ this.renderFields() }
						<EditorMediaModalDetailFileInfo item={ item } />
					</div>
				</EditorMediaModalContent>
			</figure>
		);
	}
}

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const canUserUploadFiles = canCurrentUser( state, siteId, 'upload_files' );

	return {
		isJetpack: isJetpackSite( state, siteId ),
		isVideoPressEnabled: getSiteOption( state, siteId, 'videopress_enabled' ),
		isVideoPressModuleActive: isJetpackModuleActive( state, siteId, 'videopress' ),
		isSitePrivate: isPrivateSite( state, siteId ),
		siteId,
		canUserUploadFiles,
	};
} );

export default flowRight( connectComponent, localize )( EditorMediaModalDetailItem );
