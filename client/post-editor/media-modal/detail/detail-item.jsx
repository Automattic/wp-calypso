/* eslint-disable wpcalypso/jsx-classname-namespace */

import { getUrlParts } from '@automattic/calypso-url';
import { Button, Gridicon, ScreenReaderText } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { createElement, Component } from 'react';
import { connect } from 'react-redux';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import { getMimePrefix, isItemBeingUploaded, isVideoPressItem } from 'calypso/lib/media/utils';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteOption, isJetpackModuleActive, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EditorMediaModalContent from '../content';
import EditorMediaModalDetailFields from './detail-fields';
import EditorMediaModalDetailFileInfo from './detail-file-info';
import EditorMediaModalDetailPreviewAudio from './detail-preview-audio';
import EditorMediaModalDetailPreviewDocument from './detail-preview-document';
import EditorMediaModalDetailPreviewImage from './detail-preview-image';
import EditorMediaModalDetailPreviewVideo from './detail-preview-video';

const noop = () => {};

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
		onUpdate: PropTypes.func,
	};

	static defaultProps = {
		hasPreviousItem: false,
		hasNextItem: false,
		onShowPreviousItem: noop,
		onShowNextItem: noop,
		onEdit: noop,
		onRestore: noop,
		onUpdate: noop,
	};

	/**
	 * This function returns true if the video editor can be enabled/shown.
	 *
	 * @param  {Object}  item Media item
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
	 * @param  {Object} item - media item
	 * @returns {boolean} `true` if the image-editor can be enabled.
	 */
	shouldShowImageEditingButtons( item ) {
		const { isSitePrivate, isSiteAtomic } = this.props;

		// do not allow if, for some reason, there isn't a valid item yet
		if ( ! item ) {
			return false;
		}

		// do not allow for non-atomic private sites
		if ( isSitePrivate && ! isSiteAtomic ) {
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

		if ( ! [ 'image', 'video' ].includes( mimePrefix ) ) {
			return null;
		}

		const isVideoMime = 'video' === mimePrefix;
		const editText = isVideoMime ? translate( 'Edit Thumbnail' ) : translate( 'Edit Image' );

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
		const guidParts = getUrlParts( item.guid );
		const URLParts = getUrlParts( item.URL );

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
		const { item } = this.props;

		if ( ! this.shouldShowImageEditingButtons( item ) ) {
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

		return (
			<EditorMediaModalDetailFields
				key={ `detail-fields-${ site.ID }-${ item?.ID }` }
				site={ site }
				item={ item }
				onUpdate={ this.props.onUpdate }
			/>
		);
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

		return createElement( Item, {
			key: item.ID,
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
		isSiteAtomic: isSiteAutomatedTransfer( state, siteId ),
		siteId,
		canUserUploadFiles,
	};
} );

export default flowRight( connectComponent, localize )( EditorMediaModalDetailItem );
