/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import getMediaLibrarySelectedItems from 'calypso/state/selectors/get-media-library-selected-items';
import MediaLibrary from 'calypso/my-sites/media-library';
import QueryMedia from 'calypso/components/data/query-media';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import EditorMediaModalDialog from 'calypso/post-editor/media-modal/dialog';
import { EditorMediaModalDetail } from 'calypso/post-editor/media-modal/detail';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import getMediaItem from 'calypso/state/selectors/get-media-item';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import ImageEditor from 'calypso/blocks/image-editor';
import VideoEditor from 'calypso/blocks/video-editor';
import { getMimeType } from 'calypso/lib/media/utils';
import accept from 'calypso/lib/accept';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import searchUrl from 'calypso/lib/search-url';
import { editMedia, deleteMedia } from 'calypso/state/media/thunks';
import {
	setMediaLibrarySelectedItems,
	changeMediaSource,
	clearSite,
} from 'calypso/state/media/actions';

/**
 * Style dependencies
 */
import './style.scss';

class Media extends Component {
	static propTypes = {
		selectedSite: PropTypes.object,
		filter: PropTypes.string,
		search: PropTypes.string,
		source: PropTypes.string,
		mediaId: PropTypes.number,
	};

	state = {
		currentDetail: null,
		editedImageItem: null,
		editedVideoItem: null,
		selectedItems: [],
		source: '',
	};

	containerRef = React.createRef();

	componentDidMount() {
		/* We need to rerender the inner `<MediaLibrary>` with the `containerWidth` that's
		 * available only after the container gets actually rendered. */
		/* eslint-disable-next-line react/no-did-mount-set-state */
		this.setState( {
			containerWidth: this.containerRef.current.clientWidth,
		} );
	}

	onFilterChange = ( filter ) => {
		let redirect = '/media';

		if ( filter ) {
			redirect += '/' + filter;
		}

		if ( this.props.selectedSite ) {
			redirect += '/' + this.props.selectedSite.slug;
		}

		if ( this.props.selectedSite ) {
			this.props.setMediaLibrarySelectedItems( this.props.selectedSite.ID, [] );
		}

		if ( this.props.currentRoute !== redirect ) {
			this.props.clearSite( this.props.selectedSite.ID );
		}

		page( redirect );
	};

	openDetailsModalForASingleImage = ( image ) => {
		this.setState( {
			currentDetail: 0,
			selectedItems: [ image ],
		} );
	};

	openDetailsModalForAllSelected = () => {
		const { selectedItems } = this.props;

		this.setState( {
			currentDetail: 0,
			selectedItems,
		} );
	};

	closeDetailsModal = () => {
		this.setState( {
			editedImageItem: null,
			editedVideoItem: null,
			currentDetail: null,
			selectedItems: [],
		} );
		this.maybeRedirectToAll();
	};

	maybeRedirectToAll = () => {
		const { selectedSite, mediaId, previousRoute } = this.props;
		if ( mediaId && selectedSite && selectedSite.slug ) {
			if ( previousRoute ) {
				page( previousRoute );
				return;
			}
			page( '/media/' + selectedSite.slug );
		}
	};

	editImage = () => {
		this.setState( { currentDetail: null, editedImageItem: this.getSelectedIndex() } );
	};

	editVideo = () => {
		this.setState( { currentDetail: null, editedVideoItem: this.getSelectedIndex() } );
	};

	onImageEditorCancel = ( imageEditorProps ) => {
		const { resetAllImageEditorState } = imageEditorProps;
		this.setState( { currentDetail: this.state.editedImageItem, editedImageItem: null } );

		resetAllImageEditorState();
	};

	onImageEditorDone = ( error, blob, imageEditorProps ) => {
		if ( error ) {
			this.onEditImageCancel( imageEditorProps );

			return;
		}

		const { fileName, site, ID, resetAllImageEditorState } = imageEditorProps;

		const mimeType = getMimeType( fileName );

		const item = {
			ID: ID,
			media: {
				fileName: fileName,
				fileContents: blob,
				mimeType: mimeType,
			},
		};

		this.props.editMedia( site.ID, item );
		resetAllImageEditorState();
		this.setState( { currentDetail: null, editedImageItem: null, selectedItems: [] } );
		this.maybeRedirectToAll();
	};

	getModalButtons() {
		// do not render buttons if the media image or video editor is opened
		if ( this.state.editedImageItem !== null || this.state.editedVideoItem !== null ) {
			return null;
		}

		const { translate } = this.props;

		return [
			{
				action: 'delete',
				additionalClassNames: 'is-borderless is-scary',
				label: translate( 'Delete' ),
				isPrimary: false,
				disabled: false,
				onClick: this.deleteMediaByItemDetail,
			},
			{
				action: 'confirm',
				label: translate( 'Done' ),
				isPrimary: true,
				disabled: false,
				onClose: this.closeDetailsModal,
			},
		];
	}

	onVideoEditorCancel = () => {
		this.setState( { currentDetail: this.state.editedVideoItem, editedVideoItem: null } );
	};

	onVideoEditorUpdatePoster = () => {
		this.setState( { currentDetail: null, editedVideoItem: null, selectedItems: [] } );
		this.maybeRedirectToAll();
	};

	restoreOriginalMedia = ( siteId, item ) => {
		if ( ! siteId || ! item ) {
			return;
		}

		this.props.editMedia( siteId, { ID: item.ID, media_url: item.guid } );
		this.setState( { currentDetail: null, editedImageItem: null, selectedItems: [] } );
		this.maybeRedirectToAll();
	};

	setDetailSelectedIndex = ( index ) => {
		this.setState( { currentDetail: index } );
	};

	/**
	 * Start the process to delete media items.
	 * `callback` is an optional parameter which will execute once the confirm dialog is accepted.
	 * It's used especially when the item is attempting to be removed using the item detail dialog.
	 *
	 * @param  {Function} [callback] - callback function
	 */
	deleteMedia( callback ) {
		const { translate } = this.props;
		const selectedCount = this.props.selectedItems.length;
		const confirmMessage = translate(
			'Are you sure you want to delete this item? ' +
				'Deleted media will no longer appear anywhere on your website, including all posts, pages, and widgets. ' +
				'This cannot be undone.',
			'Are you sure you want to delete these items? ' +
				'Deleted media will no longer appear anywhere on your website, including all posts, pages, and widgets. ' +
				'This cannot be undone.',
			{ count: selectedCount }
		);

		accept(
			confirmMessage,
			( accepted ) => {
				if ( ! accepted ) {
					return;
				}

				this.confirmDeleteMedia();
				if ( callback ) {
					callback();
				}
			},
			translate( 'Delete' ),
			null,
			{
				isScary: true,
			}
		);
	}

	handleDeleteMediaEvent = () => {
		this.deleteMedia();
	};

	handleSourceChange = ( source, cb ) => {
		if ( this.props.search ) {
			// Before we change the source reset the search value - it is confusing to jump between sources while searching
			searchUrl( '', this.props.search );
		}

		if ( this.props.filter ) {
			// Reset the filter so we don't switch to a source that doesn't support the filter
			this.onFilterChange( '' );
		}

		this.props.changeMediaSource( this.props.selectedSite.ID );
		this.setState( { source }, cb );
	};

	deleteMediaByItemDetail = () => {
		this.deleteMedia( () => this.closeDetailsModal() );
	};

	confirmDeleteMedia = () => {
		const site = this.props.selectedSite;

		if ( ! site ) {
			return;
		}
		const selectedItems = this.getSelectedItems();

		const selected =
			selectedItems && selectedItems.length ? selectedItems : this.props.selectedItems;

		this.props.deleteMedia( site.ID, selected );
	};

	getAnalyticsPath = () => {
		const { filter } = this.props;

		if ( filter ) {
			return `/media/${ filter }/:site`;
		}

		return '/media/:site';
	};

	getSelectedItems = () => {
		const { media } = this.props;
		if ( media ) {
			return [ media ];
		}
		return this.state.selectedItems;
	};

	getSelectedItem = ( defaultMediaItem ) => {
		const { media } = this.props;
		if ( media ) {
			return media;
		}
		return this.state.selectedItems[ defaultMediaItem ];
	};

	getSelectedIndex = () => {
		if ( this.props.media ) {
			return 0;
		}
		return this.state.currentDetail;
	};

	showDialog = ( typeOfDialog = null ) => {
		if ( typeOfDialog === 'detail' ) {
			if (
				this.props.media &&
				this.state.editedImageItem === null &&
				this.state.editedVideoItem === null
			) {
				return true;
			}
			return this.state.currentDetail !== null;
		}

		if ( this.props.media ) {
			return true;
		}
		return (
			this.state.editedImageItem !== null ||
			this.state.editedVideoItem !== null ||
			this.state.currentDetail !== null
		);
	};

	render() {
		const { selectedSite: site, mediaId, previousRoute, translate } = this.props;

		return (
			<div ref={ this.containerRef } className="main main-column media" role="main">
				{ mediaId && site && site.ID && <QueryMedia siteId={ site.ID } mediaId={ mediaId } /> }
				<PageViewTracker path={ this.getAnalyticsPath() } title="Media" />
				<DocumentHead title={ translate( 'Media' ) } />
				<SidebarNavigation />
				<FormattedHeader
					brandFont
					className="media__page-heading"
					headerText={ translate( 'Media' ) }
					align="left"
				/>
				{ this.showDialog() && (
					<EditorMediaModalDialog
						isVisible
						additionalClassNames="media__item-dialog"
						buttons={ this.getModalButtons() }
						onClose={ this.closeDetailsModal }
					>
						{ this.showDialog( 'detail' ) && (
							<EditorMediaModalDetail
								site={ site }
								items={ this.getSelectedItems() }
								selectedIndex={ this.getSelectedIndex() }
								onReturnToList={ this.closeDetailsModal }
								backButtonText={
									previousRoute ? translate( 'Back' ) : translate( 'Media Library' )
								}
								onEditImageItem={ this.editImage }
								onEditVideoItem={ this.editVideo }
								onRestoreItem={ this.restoreOriginalMedia }
								onSelectedIndexChange={ this.setDetailSelectedIndex }
							/>
						) }
						{ this.state.editedImageItem !== null && (
							<ImageEditor
								siteId={ site && site.ID }
								media={ this.getSelectedItem( this.state.editedImageItem ) }
								onDone={ this.onImageEditorDone }
								onCancel={ this.onImageEditorCancel }
							/>
						) }
						{ this.state.editedVideoItem !== null && (
							<VideoEditor
								media={ this.getSelectedItem( this.state.editedVideoItem ) }
								onCancel={ this.onVideoEditorCancel }
								onUpdatePoster={ this.onVideoEditorUpdatePoster }
							/>
						) }
					</EditorMediaModalDialog>
				) }
				{ site && site.ID && (
					<MediaLibrary
						{ ...this.props }
						className="media__main-section"
						onFilterChange={ this.onFilterChange }
						site={ site }
						single={ false }
						filter={ this.props.filter }
						source={ this.state.source }
						onEditItem={ this.openDetailsModalForASingleImage }
						onViewDetails={ this.openDetailsModalForAllSelected }
						onDeleteItem={ this.handleDeleteMediaEvent }
						onSourceChange={ this.handleSourceChange }
						modal={ false }
						containerWidth={ this.state.containerWidth }
					/>
				) }
			</div>
		);
	}
}

const mapStateToProps = ( state, { mediaId } ) => {
	const siteId = getSelectedSiteId( state );

	return {
		selectedSite: getSelectedSite( state ),
		previousRoute: getPreviousRoute( state ),
		currentRoute: getCurrentRoute( state ),
		media: getMediaItem( state, siteId, mediaId ),
		selectedItems: getMediaLibrarySelectedItems( state, siteId ),
	};
};

export default connect( mapStateToProps, {
	editMedia,
	deleteMedia,
	setMediaLibrarySelectedItems,
	changeMediaSource,
	clearSite,
} )( localize( Media ) );
