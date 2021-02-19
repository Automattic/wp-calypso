/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import {
	findIndex,
	flow,
	get,
	head,
	isEmpty,
	identity,
	includes,
	noop,
	partial,
	some,
	values,
} from 'lodash';

/**
 * Internal dependencies
 */
import MediaLibrary from 'calypso/my-sites/media-library';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { bumpStat as mcBumpStat } from 'calypso/lib/analytics/mc';
import { recordEditorEvent, recordEditorStat } from 'calypso/state/posts/stats';
import MediaModalGallery from './gallery';
import * as MediaUtils from 'calypso/lib/media/utils';
import CloseOnEscape from 'calypso/components/close-on-escape';
import accept from 'calypso/lib/accept';
import getMediaLibrarySelectedItems from 'calypso/state/selectors/get-media-library-selected-items';
import { getMediaModalView } from 'calypso/state/ui/media-modal/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { resetMediaModalView } from 'calypso/state/ui/media-modal/actions';
import { setEditorMediaModalView } from 'calypso/state/editor/actions';
import { ModalViews } from 'calypso/state/ui/media-modal/constants';
import { editMedia, deleteMedia, addExternalMedia } from 'calypso/state/media/thunks';
import {
	changeMediaSource,
	setMediaLibrarySelectedItems,
	setQuery,
} from 'calypso/state/media/actions';
import ImageEditor from 'calypso/blocks/image-editor';
import VideoEditor from 'calypso/blocks/video-editor';
import MediaModalDialog from './dialog';
import MediaModalDetail from './detail';
import { withAnalytics, bumpStat, recordGoogleEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './index.scss';

function areMediaActionsDisabled( modalView, mediaItems, isParentReady ) {
	return (
		! isParentReady( mediaItems ) ||
		some(
			mediaItems,
			( item ) =>
				MediaUtils.isItemBeingUploaded( item ) &&
				// Transients can't be handled by the editor if they are being
				// uploaded via an external URL
				( MediaUtils.getMimePrefix( item ) !== 'image' ||
					! MediaUtils.isTransientPreviewable( item ) ||
					modalView === ModalViews.GALLERY )
		)
	);
}

export class EditorMediaModal extends Component {
	static propTypes = {
		visible: PropTypes.bool,
		selectedItems: PropTypes.arrayOf( PropTypes.object ),
		onClose: PropTypes.func,
		isBackdropVisible: PropTypes.bool,
		isParentReady: PropTypes.func,
		site: PropTypes.object,
		siteId: PropTypes.number,
		labels: PropTypes.object,
		single: PropTypes.bool,
		defaultFilter: PropTypes.string,
		enabledFilters: PropTypes.arrayOf( PropTypes.string ),
		view: PropTypes.oneOf( values( ModalViews ) ),
		galleryViewEnabled: PropTypes.bool,
		setView: PropTypes.func,
		resetView: PropTypes.func,
		postId: PropTypes.number,
		disableLargeImageSources: PropTypes.bool,
		disabledDataSources: PropTypes.arrayOf( PropTypes.string ),
		onImageEditorDoneHook: PropTypes.func,
		onRestoreMediaHook: PropTypes.func,
	};

	static defaultProps = {
		visible: false,
		onClose: noop,
		isBackdropVisible: true,
		isParentReady: () => true,
		labels: Object.freeze( {} ),
		setView: noop,
		resetView: noop,
		translate: identity,
		view: ModalViews.LIST,
		galleryViewEnabled: true,
		imageEditorProps: {},
		deleteMedia: () => {},
		disableLargeImageSources: false,
		disabledDataSources: [],
		onImageEditorDoneHook: noop,
		onRestoreMediaHook: noop,
	};

	constructor( props ) {
		super( props );
		this.state = this.getDefaultState( props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.site && this.props.visible && ! nextProps.visible ) {
			this.props.setMediaLibrarySelectedItems( nextProps.site.ID, [] );
		}

		if ( this.props.visible === nextProps.visible ) {
			return;
		}

		if ( nextProps.visible ) {
			this.setState( this.getDefaultState( nextProps ) );

			if ( nextProps.source && this.state.source !== nextProps.source && nextProps.site ) {
				// Signal that we're coming from another data source
				this.props.changeMediaSource( nextProps.site.ID );
			}
		} else {
			this.props.resetView();
		}
	}

	componentDidMount() {
		this.statsTracking = {};
	}

	UNSAFE_componentWillMount() {
		const { view, selectedItems, site, single } = this.props;
		if ( ! isEmpty( selectedItems ) && ( view === ModalViews.LIST || single ) ) {
			this.props.setMediaLibrarySelectedItems( site.ID, [] );
		}
	}

	componentWillUnmount() {
		this.props.resetView();
		this.props.setMediaLibrarySelectedItems( this.props.site.ID, [] );
	}

	getDefaultState( props ) {
		return {
			filter: '',
			detailSelectedIndex: 0,
			source: props.source ? props.source : '',
			gallerySettings: props.initialGallerySettings,
		};
	}

	copyExternalAfterLoadingWordPressLibrary( selectedMedia, originalSource ) {
		const { site } = this.props;

		// Trigger the action to clear pointers/selected items
		this.props.changeMediaSource( site.ID );

		// Change our state back to WordPress
		this.setState(
			{
				source: '',
				search: undefined,
			},
			() => {
				// Reset the query so that we're adding the new media items to the correct
				// list, with no external source.
				this.props.setQuery( site.ID, {} );
				this.props.addExternalMedia( selectedMedia, site, originalSource );
			}
		);
	}

	confirmSelection = () => {
		const { view, selectedItems } = this.props;

		if ( areMediaActionsDisabled( view, selectedItems, this.props.isParentReady ) ) {
			return;
		}

		if ( selectedItems.length && this.state.source !== '' ) {
			const itemsWithTransientId = selectedItems.map( ( item ) =>
				Object.assign( {}, item, { ID: MediaUtils.createTransientMediaId(), transient: true } )
			);
			this.copyExternalAfterLoadingWordPressLibrary( itemsWithTransientId, this.state.source );
		} else {
			const value = selectedItems.length
				? {
						type: ModalViews.GALLERY === view ? 'gallery' : 'media',
						items: selectedItems,
						settings: this.state.gallerySettings,
				  }
				: undefined;
			this.props.onClose( value );
		}
	};

	isTransientSelected = () => {
		return this.props.selectedItems.some( ( item ) => item.transient );
	};

	setDetailSelectedIndex = ( index ) => {
		this.setState( {
			detailSelectedIndex: index,
		} );
	};

	setNextAvailableDetailView() {
		if ( 1 === this.props.selectedItems.length ) {
			// If this is the only selected item, return user to the list
			this.props.setView( ModalViews.LIST );
		} else if ( this.getDetailSelectedIndex() === this.props.selectedItems.length - 1 ) {
			// If this is the last selected item, decrement to the previous
			this.setDetailSelectedIndex( Math.max( this.getDetailSelectedIndex() - 1, 0 ) );
		}
	}

	confirmDeleteMedia = ( accepted ) => {
		const { site, selectedItems } = this.props;

		if ( ! site || ! accepted ) {
			return;
		}

		let toDelete = selectedItems;
		if ( ModalViews.DETAIL === this.props.view ) {
			toDelete = toDelete[ this.getDetailSelectedIndex() ];
			this.setNextAvailableDetailView();
		}

		this.props.deleteMedia( site.ID, toDelete );
		mcBumpStat( 'editor_media_actions', 'delete_media' );
	};

	deleteMedia = () => {
		const { view, selectedItems, translate } = this.props;
		let selectedCount;

		if ( ModalViews.DETAIL === view ) {
			selectedCount = 1;
		} else {
			selectedCount = selectedItems.length;
		}

		const confirmMessage = translate(
			'Are you sure you want to delete this item? ' +
				'Deleted media will no longer appear anywhere on your website, including all posts, pages, and widgets. ' +
				'This cannot be undone.',
			'Are you sure you want to delete these items? ' +
				'Deleted media will no longer appear anywhere on your website, including all posts, pages, and widgets. ' +
				'This cannot be undone.',
			{ count: selectedCount }
		);

		accept( confirmMessage, this.confirmDeleteMedia, translate( 'Delete' ), null, {
			isScary: true,
		} );
	};

	onAddMedia = () => {
		this.props.recordEditorStat( 'media_explorer_upload' );
		this.props.recordEditorEvent( 'Upload Media' );
	};

	onAddAndEditImage = () => {
		this.props.setMediaLibrarySelectedItems( this.props.site.ID, [] );

		this.props.setView( ModalViews.IMAGE_EDITOR );
	};

	restoreOriginalMedia = ( siteId, item ) => {
		if ( ! siteId || ! item ) {
			return;
		}

		this.props.editMedia( siteId, { ID: item.ID, media_url: item.guid } );

		this.props.onRestoreMediaHook();
	};

	onImageEditorDone = ( error, blob, imageEditorProps ) => {
		if ( error ) {
			this.onImageEditorCancel( imageEditorProps );

			return;
		}

		const { fileName, site, ID, resetAllImageEditorState, width, height } = imageEditorProps;

		const mimeType = MediaUtils.getMimeType( fileName );

		const item = Object.assign(
			{
				ID: ID,
				media: {
					fileName: fileName,
					fileContents: blob,
					mimeType: mimeType,
				},
			},
			width && { width },
			height && { height }
		);

		this.props.editMedia( site.ID, item );

		resetAllImageEditorState();

		this.props.setView( ModalViews.DETAIL );

		this.props.onImageEditorDoneHook();
	};

	handleUpdatePoster = () => {
		this.props.setView( ModalViews.DETAIL );
	};

	handleCancel = () => {
		const { selectedItems } = this.props;
		const item = selectedItems[ this.getDetailSelectedIndex() ];

		if ( ! item ) {
			this.props.setView( ModalViews.LIST );
			return;
		}

		this.props.setView( ModalViews.DETAIL );
	};

	onImageEditorCancel = ( imageEditorProps ) => {
		const { resetAllImageEditorState } = imageEditorProps;

		this.handleCancel();
		resetAllImageEditorState();
	};

	getDetailSelectedIndex() {
		const { selectedItems } = this.props;
		const { detailSelectedIndex } = this.state;
		if ( detailSelectedIndex >= selectedItems.length ) {
			return 0;
		}
		return detailSelectedIndex;
	}

	onFilterChange = ( filter ) => {
		if ( filter !== this.state.filter ) {
			mcBumpStat( 'editor_media_actions', 'filter_' + ( filter || 'all' ) );
		}

		this.setState( { filter } );
	};

	onScaleChange = () => {
		if ( ! this.statsTracking.scale ) {
			mcBumpStat( 'editor_media_actions', 'scale' );
			this.statsTracking.scale = true;
		}
	};

	onSearch = ( search ) => {
		this.setState( {
			search: search || undefined,
		} );

		if ( ! this.statsTracking.search ) {
			mcBumpStat( 'editor_media_actions', 'search' );
			this.statsTracking.search = true;
		}
	};

	onSourceChange = ( source ) => {
		this.props.changeMediaSource( this.props.site.ID );
		this.setState( {
			source,
			search: undefined,
			filter: '',
		} );
	};

	onClose = () => {
		this.props.onClose();
	};

	editItem = ( item ) => {
		const { site, selectedItems, single } = this.props;
		if ( ! site ) {
			return;
		}

		// Append item to set of selected items if not already selected.
		let items = selectedItems;
		if ( ! items.some( ( selected ) => selected.ID === item.ID ) ) {
			if ( single ) {
				items = [ item ];
			} else {
				items = items.concat( item );
			}
			this.props.setMediaLibrarySelectedItems( site.ID, items );
		}

		// Find and set detail selected index for the edited item
		this.setDetailSelectedIndex( findIndex( items, { ID: item.ID } ) );

		mcBumpStat( 'editor_media_actions', 'edit_button_contextual' );
		gaRecordEvent( 'Media', 'Clicked Contextual Edit Button' );

		this.props.setView( ModalViews.DETAIL );
	};

	getFirstEnabledFilter() {
		if ( this.props.enabledFilters ) {
			return head( this.props.enabledFilters );
		}
	}

	getModalButtons() {
		if ( includes( [ ModalViews.IMAGE_EDITOR, ModalViews.VIDEO_EDITOR ], this.props.view ) ) {
			return;
		}

		const selectedItems = this.props.selectedItems;
		const galleryViewEnabled = this.props.galleryViewEnabled;
		const isDisabled = areMediaActionsDisabled(
			this.props.view,
			selectedItems,
			this.props.isParentReady
		);
		const buttons = [
			{
				action: 'cancel',
				label: this.props.translate( 'Cancel' ),
			},
		];

		if ( this.state.source !== '' ) {
			buttons.push( {
				action: 'confirm',
				label: this.props.labels.confirm || this.props.translate( 'Copy to media library' ),
				isPrimary: true,
				disabled: isDisabled || 0 === selectedItems.length,
				onClick: this.confirmSelection,
			} );
		} else if (
			ModalViews.GALLERY !== this.props.view &&
			selectedItems.length > 1 &&
			galleryViewEnabled &&
			! some( selectedItems, ( item ) => MediaUtils.getMimePrefix( item ) !== 'image' )
		) {
			buttons.push( {
				action: 'confirm',
				label: this.props.translate( 'Continue' ),
				isPrimary: true,
				disabled: isDisabled || ! this.props.site,
				onClick: partial( this.props.setView, ModalViews.GALLERY ),
			} );
		} else {
			buttons.push( {
				action: 'confirm',
				label: this.props.labels.confirm || this.props.translate( 'Insert' ),
				isPrimary: true,
				disabled: isDisabled || 0 === selectedItems.length || this.isTransientSelected(),
				onClick: this.confirmSelection,
			} );
		}

		return buttons;
	}

	shouldClose() {
		return ! includes( [ ModalViews.IMAGE_EDITOR, ModalViews.VIDEO_EDITOR ], this.props.view );
	}

	updateSettings = ( gallerySettings ) => {
		this.setState( { gallerySettings } );
	};

	renderContent() {
		let content;

		switch ( this.props.view ) {
			case ModalViews.DETAIL:
				content = (
					<MediaModalDetail
						site={ this.props.site }
						items={ this.props.selectedItems }
						selectedIndex={ this.getDetailSelectedIndex() }
						onRestoreItem={ this.restoreOriginalMedia }
						onSelectedIndexChange={ this.setDetailSelectedIndex }
					/>
				);
				break;

			case ModalViews.GALLERY:
				content = (
					<MediaModalGallery
						site={ this.props.site }
						items={ this.props.selectedItems }
						settings={ this.state.gallerySettings }
						onUpdateSettings={ this.updateSettings }
					/>
				);
				break;

			case ModalViews.IMAGE_EDITOR: {
				const { site, imageEditorProps, selectedItems: items } = this.props;
				const selectedIndex = this.getDetailSelectedIndex();
				const media = get( items, selectedIndex, null );

				content = (
					<ImageEditor
						siteId={ get( site, 'ID' ) }
						media={ media }
						onDone={ this.onImageEditorDone }
						onCancel={ this.onImageEditorCancel }
						{ ...imageEditorProps }
					/>
				);

				break;
			}

			case ModalViews.VIDEO_EDITOR: {
				const { selectedItems: items } = this.props;
				const selectedIndex = this.getDetailSelectedIndex();
				const media = get( items, selectedIndex, null );

				content = (
					<VideoEditor
						media={ media }
						onCancel={ this.handleCancel }
						onUpdatePoster={ this.handleUpdatePoster }
					/>
				);

				break;
			}

			default:
				content = (
					<MediaLibrary
						site={ this.props.site }
						filter={ this.state.filter || this.props.defaultFilter || this.getFirstEnabledFilter() }
						enabledFilters={ this.props.enabledFilters }
						search={ this.state.search }
						source={ this.state.source }
						onAddMedia={ this.onAddMedia }
						onAddAndEditImage={ this.onAddAndEditImage }
						onFilterChange={ this.onFilterChange }
						onScaleChange={ this.onScaleChange }
						onSourceChange={ this.onSourceChange }
						onSearch={ this.onSearch }
						onEditItem={ this.editItem }
						fullScreenDropZone={ false }
						single={ this.props.single }
						onDeleteItem={ this.deleteMedia }
						onViewDetails={ this.props.onViewDetails }
						postId={ this.props.postId }
						disableLargeImageSources={ this.props.disableLargeImageSources }
						disabledDataSources={ this.props.disabledDataSources }
						scrollable
					/>
				);
				break;
		}

		return content;
	}

	render() {
		return (
			<MediaModalDialog
				isVisible={ this.props.visible }
				buttons={ this.getModalButtons() }
				onClose={ this.onClose }
				isBackdropVisible={ this.props.isBackdropVisible }
				shouldCloseOnOverlayClick={ this.shouldClose() }
				shouldCloseOnEsc={ false }
			>
				<CloseOnEscape onEscape={ this.onClose } />
				{ this.renderContent() }
			</MediaModalDialog>
		);
	}
}

export default connect(
	( state, { site, siteId } ) => ( {
		view: getMediaModalView( state ),
		// [TODO]: Migrate toward dropping incoming site prop, accepting only
		// siteId and forcing descendant components to access via state
		site: site || getSite( state, siteId ),
		postId: getEditorPostId( state ),
		selectedItems: getMediaLibrarySelectedItems( state, site?.ID ?? siteId ),
	} ),
	{
		setView: setEditorMediaModalView,
		resetView: resetMediaModalView,
		deleteMedia,
		onViewDetails: flow(
			withAnalytics( bumpStat( 'editor_media_actions', 'edit_button_dialog' ) ),
			withAnalytics( recordGoogleEvent( 'Media', 'Clicked Dialog Edit Button' ) ),
			partial( setEditorMediaModalView, ModalViews.DETAIL )
		),
		recordEditorEvent,
		recordEditorStat,
		editMedia,
		setMediaLibrarySelectedItems,
		setQuery,
		addExternalMedia,
		changeMediaSource,
	}
)( localize( EditorMediaModal ) );
