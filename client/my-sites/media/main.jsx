import page from '@automattic/calypso-router';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import ImageEditor from 'calypso/blocks/image-editor';
import VideoEditor from 'calypso/blocks/video-editor';
import DocumentHead from 'calypso/components/data/document-head';
import QueryMedia from 'calypso/components/data/query-media';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import { withEditMedia } from 'calypso/data/media/use-edit-media-mutation';
import { withDeleteMedia } from 'calypso/data/media/with-delete-media';
import accept from 'calypso/lib/accept';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getMimeType } from 'calypso/lib/media/utils';
import searchUrl from 'calypso/lib/search-url';
import MediaLibrary from 'calypso/my-sites/media-library';
import { EditorMediaModalDetail } from 'calypso/post-editor/media-modal/detail';
import EditorMediaModalDialog from 'calypso/post-editor/media-modal/dialog';
import { withJetpackConnectionProblem } from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem.js';
import { selectMediaItems, changeMediaSource, clearSite } from 'calypso/state/media/actions';
import { successNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getMediaItem from 'calypso/state/selectors/get-media-item';
import getMediaLibrarySelectedItems from 'calypso/state/selectors/get-media-library-selected-items';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

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

	containerRef = createRef();

	componentDidMount() {
		/* We need to rerender the inner `<MediaLibrary>` with the `containerWidth` that's
		 * available only after the container gets actually rendered. */
		/* eslint-disable-next-line react/no-did-mount-set-state */
		this.setState( {
			containerWidth: this.containerRef.current.clientWidth,
		} );

		const params = new URLSearchParams( window.location.search );
		const upgradeStatus = params.get( 'upgrade' );
		if ( upgradeStatus ) {
			this.showUpgradeStatusNotice( upgradeStatus );
		}
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
			this.props.selectMediaItems( this.props.selectedSite.ID, [] );
		}

		if ( this.props.currentRoute !== redirect ) {
			this.props.clearSite( this.props.selectedSite.ID );
		}

		page( redirect );
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

	updateItem = ( itemId, detail ) => {
		const { selectedItems } = this.state;
		const index = selectedItems.findIndex( ( item ) => item.ID === itemId );

		if ( index === -1 ) {
			return;
		}

		selectedItems.splice( index, 1, {
			...selectedItems[ index ],
			...detail,
		} );

		this.setState( {
			...this.state,
			selectedItems,
		} );
	};

	setDetailSelectedIndex = ( index ) => {
		this.setState( { currentDetail: index } );
	};

	/**
	 * Start the process to delete media items.
	 * `callback` is an optional parameter which will execute once the confirm dialog is accepted.
	 * It's used especially when the item is attempting to be removed using the item detail dialog.
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
		const selectedIds = selected.map( ( { ID } ) => ID );

		this.props.deleteMedia( site.ID, selectedIds );
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

	showUpgradeStatusNotice = ( status ) => {
		const { translate, filter, successNotice: showSuccessNotice } = this.props;
		let message = '';
		if ( filter === 'audio' ) {
			message = translate( 'Audio upload has been enabled.' );
		} else if ( filter === 'videos' ) {
			message = translate( 'Video upload has been enabled.' );
		}

		if ( status === 'success' && message ) {
			showSuccessNotice( message );
		}
	};

	render() {
		const {
			selectedSite: site,
			mediaId,
			previousRoute,
			translate,
			siteId,
			isJetpack,
			isPossibleJetpackConnectionProblem,
		} = this.props;

		return (
			<div ref={ this.containerRef } className="main main-column media" role="main">
				{ mediaId && site && site.ID && <QueryMedia siteId={ site.ID } mediaId={ mediaId } /> }
				<PageViewTracker path={ this.getAnalyticsPath() } title="Media" />
				{ isJetpack && isPossibleJetpackConnectionProblem && (
					<JetpackConnectionHealthBanner siteId={ siteId } />
				) }
				<DocumentHead title={ translate( 'Media' ) } />
				<NavigationHeader
					screenOptionsTab="upload.php?preferred-view=classic"
					title={ translate( 'Media' ) }
					subtitle={ translate(
						'Manage all the media on your site, including images, video, and more. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="media" showIcon={ false } />,
							},
						}
					) }
				/>

				{ this.props.selectedSite.is_private && this.props.selectedSite.is_wpcom_atomic && (
					<Notice
						showDismiss={ false }
						status="is-info"
						text={ translate(
							'The image CDN is disabled because your site is marked Private. If image thumbnails do not display in your Media Library, you can switch to Coming Soon mode. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
							{
								components: {
									learnMoreLink: <InlineSupportLink supportContext="privacy" showIcon={ false } />,
								},
							}
						) }
					/>
				) }
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
								onUpdateItem={ this.updateItem }
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
		siteId,
		selectedSite: getSelectedSite( state ),
		previousRoute: getPreviousRoute( state ),
		currentRoute: getCurrentRoute( state ),
		isJetpack: isJetpackSite( state, siteId ),
		media: getMediaItem( state, siteId, mediaId ),
		selectedItems: getMediaLibrarySelectedItems( state, siteId ),
	};
};

export default connect( mapStateToProps, {
	selectMediaItems,
	changeMediaSource,
	clearSite,
	successNotice,
} )( localize( withJetpackConnectionProblem( withDeleteMedia( withEditMedia( Media ) ) ) ) );
