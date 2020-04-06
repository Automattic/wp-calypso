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
	map,
	noop,
	partial,
	some,
	uniqueId,
	values,
} from 'lodash';

/**
 * Internal dependencies
 */
import MediaLibrary from 'my-sites/media-library';
import { gaRecordEvent } from 'lib/analytics/ga';
import { bumpStat as mcBumpStat } from 'lib/analytics/mc';
import { recordEditorEvent, recordEditorStat } from 'state/posts/stats';
import MediaModalGallery from './gallery';
import MediaActions from 'lib/media/actions';
import * as MediaUtils from 'lib/media/utils';
import CloseOnEscape from 'components/close-on-escape';
import accept from 'lib/accept';
import { getMediaModalView } from 'state/ui/media-modal/selectors';
import { getSite } from 'state/sites/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { resetMediaModalView } from 'state/ui/media-modal/actions';
import { setEditorMediaModalView } from 'state/ui/editor/actions';
import { ModalViews } from 'state/ui/media-modal/constants';
import { deleteMedia } from 'state/media/actions';
import ImageEditor from 'blocks/image-editor';
import VideoEditor from 'blocks/video-editor';
import MediaModalDialog from './dialog';
import MediaModalDetail from './detail';
import { withAnalytics, bumpStat, recordGoogleEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './index.scss';

function areMediaActionsDisabled( modalView, mediaItems, isParentReady ) {
	return (
		! isParentReady( mediaItems ) ||
		some(
			mediaItems,
			item =>
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
		mediaLibrarySelectedItems: PropTypes.arrayOf( PropTypes.object ),
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
		mediaLibrarySelectedItems: Object.freeze( [] ),
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
			MediaActions.setLibrarySelectedItems( nextProps.site.ID, [] );
		}

		if ( this.props.visible === nextProps.visible ) {
			return;
		}

		if ( nextProps.visible ) {
			this.setState( this.getDefaultState( nextProps ) );

			if ( nextProps.source && this.state.source !== nextProps.source && nextProps.site ) {
				// Signal that we're coming from another data source
				MediaActions.sourceChanged( nextProps.site.ID );
			}
		} else {
			this.props.resetView();
		}
	}

	componentDidMount() {
		this.statsTracking = {};
	}

	UNSAFE_componentWillMount() {
		const { view, mediaLibrarySelectedItems, site, single } = this.props;
		if ( ! isEmpty( mediaLibrarySelectedItems ) && ( view === ModalViews.LIST || single ) ) {
			MediaActions.setLibrarySelectedItems( site.ID, [] );
		}
	}

	componentWillUnmount() {
		this.props.resetView();
		MediaActions.setLibrarySelectedItems( this.props.site.ID, [] );
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
		MediaActions.sourceChanged( site.ID );

		// Change our state back to WordPress
		this.setState(
			{
				source: '',
				search: undefined,
			},
			() => {
				// Reset the query so that we're adding the new media items to the correct
				// list, with no external source.
				MediaActions.setQuery( site.ID, {} );
				MediaActions.addExternal( site, selectedMedia, originalSource );
			}
		);
	}

	copyExternal( selectedMedia, originalSource ) {
		const { site } = this.props;
		const hasSearch = !! this.state.search;
		if ( hasSearch ) {
			// For unsorted external sources based on a search, when inserting a single image, there's a visual glitch
			// where one of the items in the list cycles through other items. This seems to happen when receiving
			// the new image, and the media store is updating pointers. We switch back to no source and no search
			// before we upload the new image so that the glitch is hidden. The glitch is _purely_ visual, and all
			// images, transient or otherwise are correctly dealt with.
			this.setState( {
				search: '',
			} );
		}
		MediaActions.addExternal( site, selectedMedia, originalSource );
		if ( hasSearch ) {
			// make sure that query change gets everywhere so next time the source is loaded,
			// or the WP media library is opened, the new media is loaded
			// This has to happen _after_ the external files are added, or else they
			// don't show up.
			MediaActions.setQuery( site.ID, {} );
		}
	}

	confirmSelection = () => {
		const { view, mediaLibrarySelectedItems } = this.props;

		if ( areMediaActionsDisabled( view, mediaLibrarySelectedItems, this.props.isParentReady ) ) {
			return;
		}

		if ( mediaLibrarySelectedItems.length && this.state.source !== '' ) {
			const itemsWithTransientId = mediaLibrarySelectedItems.map( item =>
				Object.assign( {}, item, { ID: uniqueId( 'media-' ), transient: true } )
			);
			this.copyExternalAfterLoadingWordPressLibrary( itemsWithTransientId, this.state.source );
		} else {
			const value = mediaLibrarySelectedItems.length
				? {
						type: ModalViews.GALLERY === view ? 'gallery' : 'media',
						items: mediaLibrarySelectedItems,
						settings: this.state.gallerySettings,
				  }
				: undefined;
			this.props.onClose( value );
		}
	};

	isTransientSelected = () => {
		return this.props.mediaLibrarySelectedItems.some( item => item.transient );
	};

	setDetailSelectedIndex = index => {
		this.setState( {
			detailSelectedIndex: index,
		} );
	};

	setNextAvailableDetailView() {
		if ( 1 === this.props.mediaLibrarySelectedItems.length ) {
			// If this is the only selected item, return user to the list
			this.props.setView( ModalViews.LIST );
		} else if (
			this.getDetailSelectedIndex() ===
			this.props.mediaLibrarySelectedItems.length - 1
		) {
			// If this is the last selected item, decrement to the previous
			this.setDetailSelectedIndex( Math.max( this.getDetailSelectedIndex() - 1, 0 ) );
		}
	}

	confirmDeleteMedia = accepted => {
		const { site, mediaLibrarySelectedItems } = this.props;

		if ( ! site || ! accepted ) {
			return;
		}

		let toDelete = mediaLibrarySelectedItems;
		if ( ModalViews.DETAIL === this.props.view ) {
			toDelete = toDelete[ this.getDetailSelectedIndex() ];
			this.setNextAvailableDetailView();
		}

		MediaActions.delete( site.ID, toDelete );
		mcBumpStat( 'editor_media_actions', 'delete_media' );
		this.props.deleteMedia( site.ID, map( toDelete, 'ID' ) );
	};

	deleteMedia = () => {
		const { view, mediaLibrarySelectedItems, translate } = this.props;
		let selectedCount;

		if ( ModalViews.DETAIL === view ) {
			selectedCount = 1;
		} else {
			selectedCount = mediaLibrarySelectedItems.length;
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
		MediaActions.setLibrarySelectedItems( this.props.site.ID, [] );

		this.props.setView( ModalViews.IMAGE_EDITOR );
	};

	restoreOriginalMedia = ( siteId, item ) => {
		if ( ! siteId || ! item ) {
			return;
		}

		MediaActions.update( siteId, { ID: item.ID, media_url: item.guid }, true );

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

		MediaActions.update( site.ID, item, true );

		resetAllImageEditorState();

		this.props.setView( ModalViews.DETAIL );

		this.props.onImageEditorDoneHook();
	};

	handleUpdatePoster = ( { ID, posterUrl } ) => {
		const { site } = this.props;

		// Photon does not support URLs with a querystring component.
		const urlBeforeQuery = ( posterUrl || '' ).split( '?' )[ 0 ];

		if ( site ) {
			MediaActions.edit( site.ID, {
				ID,
				thumbnails: {
					fmt_hd: urlBeforeQuery,
					fmt_dvd: urlBeforeQuery,
					fmt_std: urlBeforeQuery,
				},
			} );
		}

		this.props.setView( ModalViews.DETAIL );
	};

	handleCancel = () => {
		const { mediaLibrarySelectedItems } = this.props;
		const item = mediaLibrarySelectedItems[ this.getDetailSelectedIndex() ];

		if ( ! item ) {
			this.props.setView( ModalViews.LIST );
			return;
		}

		this.props.setView( ModalViews.DETAIL );
	};

	onImageEditorCancel = imageEditorProps => {
		const { resetAllImageEditorState } = imageEditorProps;

		this.handleCancel();
		resetAllImageEditorState();
	};

	getDetailSelectedIndex() {
		const { mediaLibrarySelectedItems } = this.props;
		const { detailSelectedIndex } = this.state;
		if ( detailSelectedIndex >= mediaLibrarySelectedItems.length ) {
			return 0;
		}
		return detailSelectedIndex;
	}

	onFilterChange = filter => {
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

	onSearch = search => {
		this.setState( {
			search: search || undefined,
		} );

		if ( ! this.statsTracking.search ) {
			mcBumpStat( 'editor_media_actions', 'search' );
			this.statsTracking.search = true;
		}
	};

	onSourceChange = source => {
		MediaActions.sourceChanged( this.props.site.ID );
		this.setState( {
			source,
			search: undefined,
			filter: '',
		} );
	};

	onClose = () => {
		this.props.onClose();
	};

	editItem = item => {
		const { site, mediaLibrarySelectedItems, single } = this.props;
		if ( ! site ) {
			return;
		}

		// Append item to set of selected items if not already selected.
		let items = mediaLibrarySelectedItems;
		if ( ! items.some( selected => selected.ID === item.ID ) ) {
			if ( single ) {
				items = [ item ];
			} else {
				items = items.concat( item );
			}
			MediaActions.setLibrarySelectedItems( site.ID, items );
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

		const selectedItems = this.props.mediaLibrarySelectedItems;
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
			! some( selectedItems, item => MediaUtils.getMimePrefix( item ) !== 'image' )
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

	updateSettings = gallerySettings => {
		this.setState( { gallerySettings } );
	};

	renderContent() {
		let content;

		switch ( this.props.view ) {
			case ModalViews.DETAIL:
				content = (
					<MediaModalDetail
						site={ this.props.site }
						items={ this.props.mediaLibrarySelectedItems }
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
						items={ this.props.mediaLibrarySelectedItems }
						settings={ this.state.gallerySettings }
						onUpdateSettings={ this.updateSettings }
					/>
				);
				break;

			case ModalViews.IMAGE_EDITOR: {
				const { site, imageEditorProps, mediaLibrarySelectedItems: items } = this.props;
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
				const { mediaLibrarySelectedItems: items } = this.props;
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
						mediaLibrarySelectedItems={ this.props.mediaLibrarySelectedItems }
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
	}
)( localize( EditorMediaModal ) );
