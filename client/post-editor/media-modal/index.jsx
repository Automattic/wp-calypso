/**
 * External dependencies
 */
var React = require( 'react' ),
	closest = require( 'component-closest' ),
	debug = require( 'debug' )( 'calypso:post-editor:media' );
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { noop, head, some, findIndex, partial, values, map } from 'lodash';

/**
 * Internal dependencies
 */
var MediaLibrary = require( 'my-sites/media-library' ),
	analytics = require( 'lib/analytics' ),
	PostStats = require( 'lib/posts/stats' ),
	MediaModalSecondaryActions = require( './secondary-actions' ),
	MediaModalGallery = require( './gallery' ),
	MediaActions = require( 'lib/media/actions' ),
	MediaUtils = require( 'lib/media/utils' ),
	Dialog = require( 'components/dialog' ),
	accept = require( 'lib/accept' );
import { getSelectedMediaItems } from 'state/media/selectors';
import { getMediaModalView } from 'state/ui/media-modal/selectors';
import { getSite } from 'state/sites/selectors';
import { selectMediaItems } from 'state/media/actions';
import { resetMediaModalView } from 'state/ui/media-modal/actions';
import { setEditorMediaModalView } from 'state/ui/editor/actions';
import { ModalViews } from 'state/ui/media-modal/constants';
import { deleteMedia } from 'state/media/actions';
import ImageEditor from 'blocks/image-editor';
import MediaModalDetail from './detail';

export const EditorMediaModal = React.createClass( {
	propTypes: {
		visible: React.PropTypes.bool,
		selectedItems: React.PropTypes.arrayOf( React.PropTypes.object ),
		onClose: React.PropTypes.func,
		site: React.PropTypes.object,
		siteId: React.PropTypes.number,
		labels: React.PropTypes.object,
		single: React.PropTypes.bool,
		defaultFilter: React.PropTypes.string,
		enabledFilters: React.PropTypes.arrayOf( React.PropTypes.string ),
		view: React.PropTypes.oneOf( values( ModalViews ) ),
		setView: React.PropTypes.func,
		resetView: React.PropTypes.func
	},

	getInitialState: function() {
		return this.getDefaultState( this.props );
	},

	getDefaultProps: function() {
		return {
			visible: false,
			selectedItems: Object.freeze( {} ),
			onClose: noop,
			labels: Object.freeze( {} ),
			setView: noop,
			resetView: noop,
			view: ModalViews.LIST,
			imageEditorProps: {},
			deleteMedia: () => {}
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.site && this.props.visible && ! nextProps.visible ) {
			this.props.selectMediaItems( nextProps.site.ID, [] );
		}

		if ( this.props.visible === nextProps.visible ) {
			return;
		}

		if ( nextProps.visible ) {
			this.replaceState( this.getDefaultState( nextProps ) );
		} else {
			this.props.resetView();
		}
	},

	componentDidMount: function() {
		debug( '%s component mounted.', this.constructor.name );

		this.statsTracking = {};
	},

	componentWillUnmount() {
		this.props.resetView();
		this.props.selectMediaItems( this.props.site.ID, [] );
	},

	getDefaultState: function( props ) {
		return {
			filter: '',
			detailSelectedIndex: 0,
			gallerySettings: props.initialGallerySettings
		};
	},

	isDisabled: function() {
		return some( this.props.selectedItems, function( item ) {
			var mimePrefix = MediaUtils.getMimePrefix( item );
			return item.transient && ( mimePrefix !== 'image' || ModalViews.GALLERY === this.props.view );
		}.bind( this ) );
	},

	confirmSelection: function() {
		const { view, selectedItems } = this.props;

		let value;
		if ( selectedItems.length ) {
			value = {
				type: ModalViews.GALLERY === view ? 'gallery' : 'media',
				items: selectedItems,
				settings: this.state.gallerySettings
			};
		}

		this.props.onClose( value );
	},

	setDetailSelectedIndex: function( index ) {
		this.setState( {
			detailSelectedIndex: index
		} );
	},

	setNextAvailableDetailView: function() {
		if ( 1 === this.props.selectedItems.length ) {
			// If this is the only selected item, return user to the list
			this.props.setView( ModalViews.LIST );
		} else if ( this.getDetailSelectedIndex() === this.props.selectedItems.length - 1 ) {
			// If this is the last selected item, decrement to the previous
			this.setDetailSelectedIndex( Math.max( this.getDetailSelectedIndex() - 1, 0 ) );
		}
	},

	confirmDeleteMedia: function( accepted ) {
		const { site, selectedItems } = this.props;

		if ( ! site || ! accepted ) {
			return;
		}

		let toDelete = selectedItems;

		if ( ModalViews.DETAIL === this.props.view ) {
			toDelete = toDelete[ this.getDetailSelectedIndex() ];
			this.setNextAvailableDetailView();
		}

		MediaActions.delete( site.ID, toDelete );
		analytics.mc.bumpStat( 'editor_media_actions', 'delete_media' );
		this.props.deleteMedia( site.ID, map( toDelete, 'ID' ) );
	},

	deleteMedia: function() {
		let selectedCount;

		if ( ModalViews.DETAIL === this.props.view ) {
			selectedCount = 1;
		} else {
			selectedCount = this.props.selectedItems.length;
		}

		const confirmMessage = this.translate(
			'Are you sure you want to permanently delete this item?',
			'Are you sure you want to permanently delete these items?',
			{ count: selectedCount }
		);

		accept( confirmMessage, this.confirmDeleteMedia );
	},

	onAddMedia: function() {
		PostStats.recordStat( 'media_explorer_upload' );
		PostStats.recordEvent( 'Upload Media' );
	},

	onAddAndEditImage: function() {
		this.props.selectMediaItems( this.props.site.ID, [] );
		this.props.setView( ModalViews.IMAGE_EDITOR );
	},

	restoreOriginalMedia: function( siteId, item ) {
		if ( ! siteId || ! item ) {
			return;
		}

		this.props.updateMediaItem( siteId, { ID: item.ID, media_url: item.guid }, true );
	},

	onImageEditorDone( error, blob, imageEditorProps ) {
		if ( error ) {
			this.onImageEditorCancel( imageEditorProps );

			return;
		}

		const {
			fileName,
			site,
			ID,
			resetAllImageEditorState
		} = imageEditorProps;

		const mimeType = MediaUtils.getMimeType( fileName );

		const item = {
			ID: ID,
			media: {
				fileName: fileName,
				fileContents: blob,
				mimeType: mimeType
			}
		};

		MediaActions.update( site.ID, item, true );

		resetAllImageEditorState();

		this.props.setView( ModalViews.DETAIL );
	},

	onImageEditorCancel: function( imageEditorProps ) {
		const { selectedItems } = this.props;

		const item = selectedItems[ this.getDetailSelectedIndex() ];

		if ( ! item ) {
			this.props.setView( ModalViews.LIST );
			return;
		}

		this.props.setView( ModalViews.DETAIL );

		const {	resetAllImageEditorState } = imageEditorProps;

		resetAllImageEditorState();
	},

	getDetailSelectedIndex() {
		const { selectedItems } = this.props;
		const { detailSelectedIndex } = this.state;
		if ( detailSelectedIndex >= selectedItems.length ) {
			return 0;
		}
		return detailSelectedIndex;
	},

	onFilterChange: function( filter ) {
		if ( filter !== this.state.filter ) {
			analytics.mc.bumpStat( 'editor_media_actions', 'filter_' + ( filter || 'all' ) );
		}

		this.setState( {
			filter: filter
		} );
	},

	onScaleChange: function() {
		if ( ! this.statsTracking.scale ) {
			analytics.mc.bumpStat( 'editor_media_actions', 'scale' );
			this.statsTracking.scale = true;
		}
	},

	onSearch: function( search ) {
		this.setState( {
			search: search || undefined
		} );

		if ( ! this.statsTracking.search ) {
			analytics.mc.bumpStat( 'editor_media_actions', 'search' );
			this.statsTracking.search = true;
		}
	},

	onClose: function() {
		this.props.onClose();
	},

	editItem: function( item ) {
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
			this.props.selectMediaItems( site.ID, items );
		}

		// Find and set detail selected index for the edited item
		this.setDetailSelectedIndex( findIndex( items, { ID: item.ID } ) );

		analytics.mc.bumpStat( 'editor_media_actions', 'edit_button_contextual' );
		analytics.ga.recordEvent( 'Media', 'Clicked Contextual Edit Button' );

		this.props.setView( ModalViews.DETAIL );
	},

	getFirstEnabledFilter: function() {
		if ( this.props.enabledFilters ) {
			return head( this.props.enabledFilters );
		}
	},

	getModalButtons: function() {
		var isDisabled = this.isDisabled(),
			selectedItems = this.props.selectedItems,
			buttons;

		if ( ModalViews.IMAGE_EDITOR === this.props.view ) {
			return;
		}

		buttons = [
			<MediaModalSecondaryActions
				site={ this.props.site }
				selectedItems={ selectedItems }
				disabled={ isDisabled }
				onDelete={ this.deleteMedia } />,
			{
				action: 'cancel',
				label: this.translate( 'Cancel' )
			}
		];

		if ( ModalViews.GALLERY !== this.props.view && selectedItems.length > 1 &&
				! some( selectedItems, ( item ) => MediaUtils.getMimePrefix( item ) !== 'image' ) ) {
			buttons.push( {
				action: 'confirm',
				label: this.translate( 'Continue' ),
				isPrimary: true,
				disabled: isDisabled || ! this.props.site,
				onClick: partial( this.props.setView, ModalViews.GALLERY )
			} );
		} else {
			buttons.push( {
				action: 'confirm',
				label: this.props.labels.confirm || this.translate( 'Insert' ),
				isPrimary: true,
				disabled: isDisabled || 0 === selectedItems.length,
				onClick: this.confirmSelection
			} );
		}

		return buttons;
	},

	preventClose: function( event ) {
		if ( ModalViews.IMAGE_EDITOR === this.props.view ||
			closest( event.target, '.popover.is-dialog-visible' ) ) {
			return true;
		}
	},

	renderContent: function() {
		var content;

		switch ( this.props.view ) {
			case ModalViews.DETAIL:
				content = (
					<MediaModalDetail
						site={ this.props.site }
						items={ this.props.selectedItems }
						selectedIndex={ this.getDetailSelectedIndex() }
						onRestoreItem={ this.restoreOriginalMedia }
						onSelectedIndexChange={ this.setDetailSelectedIndex } />
				);
				break;

			case ModalViews.GALLERY:
				content = (
					<MediaModalGallery
						site={ this.props.site }
						items={ this.props.selectedItems }
						settings={ this.state.gallerySettings }
						onUpdateSettings={ ( gallerySettings ) => this.setState( { gallerySettings } ) } />
				);
				break;

			case ModalViews.IMAGE_EDITOR:
				const {
					site,
					imageEditorProps,
					selectedItems
				} = this.props;

				const selectedIndex = this.getDetailSelectedIndex();
				const media = selectedItems ? selectedItems[ selectedIndex ] : null;

				content = (
					<ImageEditor
						siteId={ site && site.ID }
						media={ media }
						onDone={ this.onImageEditorDone }
						onCancel={ this.onImageEditorCancel }
						{ ...imageEditorProps }
					/>
				);
				break;

			default:
				content = (
					<MediaLibrary
						site={ this.props.site }
						filter={ this.state.filter || this.props.defaultFilter || this.getFirstEnabledFilter() }
						enabledFilters={ this.props.enabledFilters }
						search={ this.state.search }
						onAddMedia={ this.onAddMedia }
						onAddAndEditImage={ this.onAddAndEditImage }
						onFilterChange={ this.onFilterChange }
						onScaleChange={ this.onScaleChange }
						onSearch={ this.onSearch }
						onEditItem={ this.editItem }
						fullScreenDropZone={ false }
						single={ this.props.single }
						scrollable />
				);
				break;
		}

		return content;
	},

	render: function() {
		return (
			<Dialog
				isVisible={ this.props.visible }
				buttons={ this.getModalButtons() }
				onClose={ this.onClose }
				additionalClassNames="editor-media-modal"
				onClickOutside={ this.preventClose }>
				{ this.renderContent() }
			</Dialog>
		);
	}
} );

export default connect(
	( state, { site, siteId } ) => ( {
		view: getMediaModalView( state ),
		// [TODO]: Migrate toward dropping incoming site prop, accepting only
		// siteId and forcing descendant components to access via state
		site: site || getSite( state, siteId ),
		selectedItems: getSelectedMediaItems( state, siteId || site.ID ),
	} ),
	( dispatch ) => {
		return bindActionCreators( {
			setView: setEditorMediaModalView,
			resetView: resetMediaModalView,
			deleteMedia,
			selectMediaItems
		}, dispatch );
	}
)( EditorMediaModal );
