/**
 * External dependencies
 */
var React = require( 'react' ),
	closest = require( 'component-closest' ),
	debug = require( 'debug' )( 'calypso:post-editor:media' );
import { connect } from 'react-redux';
import { noop, head, some, findIndex, partial, values } from 'lodash';

/**
 * Internal dependencies
 */
var MediaLibrary = require( 'my-sites/media-library' ),
	analytics = require( 'lib/analytics' ),
	PostActions = require( 'lib/posts/actions' ),
	PostStats = require( 'lib/posts/stats' ),
	MediaModalSecondaryActions = require( './secondary-actions' ),
	MediaModalDetail = require( './detail' ),
	MediaModalGallery = require( './gallery' ),
	MediaActions = require( 'lib/media/actions' ),
	MediaUtils = require( 'lib/media/utils' ),
	Dialog = require( 'components/dialog' ),
	markup = require( './markup' ),
	accept = require( 'lib/accept' );
import { getMediaModalView } from 'state/ui/media-modal/selectors';
import { resetMediaModalView } from 'state/ui/media-modal/actions';
import { setEditorMediaModalView } from 'state/ui/editor/actions';
import { ModalViews } from 'state/ui/media-modal/constants';
import ImageEditor from 'blocks/image-editor';

export const EditorMediaModal = React.createClass( {
	propTypes: {
		visible: React.PropTypes.bool,
		mediaLibrarySelectedItems: React.PropTypes.arrayOf( React.PropTypes.object ),
		onClose: React.PropTypes.func,
		onInsertMedia: React.PropTypes.func,
		site: React.PropTypes.object,
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
			mediaLibrarySelectedItems: Object.freeze( [] ),
			onClose: noop,
			onInsertMedia: noop,
			labels: Object.freeze( {} ),
			setView: noop,
			resetView: noop,
			view: ModalViews.LIST
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.site && this.props.visible && ! nextProps.visible ) {
			MediaActions.setLibrarySelectedItems( nextProps.site.ID, [] );
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
	},

	getDefaultState: function( props ) {
		return {
			filter: '',
			detailSelectedIndex: 0,
			gallerySettings: props.initialGallerySettings
		};
	},

	isDisabled: function() {
		return some( this.props.mediaLibrarySelectedItems, function( item ) {
			var mimePrefix = MediaUtils.getMimePrefix( item );
			return item.transient && ( mimePrefix !== 'image' || ModalViews.GALLERY === this.props.view );
		}.bind( this ) );
	},

	confirmSelection: function() {
		var selectedItems = this.props.mediaLibrarySelectedItems,
			gallerySettings = this.state.gallerySettings,
			media, stat;

		if ( ! this.props.visible ) {
			return;
		}

		if ( ModalViews.GALLERY === this.props.view ) {
			if ( gallerySettings && 'individual' === gallerySettings.type ) {
				media = gallerySettings.items.map( markup.get ).join( '' );
			} else {
				media = MediaUtils.generateGalleryShortcode( gallerySettings );
			}
			stat = 'insert_gallery';
		} else {
			media = selectedItems.map( markup.get ).join( '' );
			stat = 'insert_item';
		}

		if ( some( selectedItems, 'transient' ) ) {
			PostActions.blockSave( 'MEDIA_MODAL_TRANSIENT_INSERT' );
		}

		if ( media ) {
			this.props.onInsertMedia( media );

			if ( stat ) {
				analytics.mc.bumpStat( 'editor_media_actions', stat );
			}
		}

		this.props.onClose( selectedItems );
	},

	setDetailSelectedIndex: function( index ) {
		this.setState( {
			detailSelectedIndex: index
		} );
	},

	setNextAvailableDetailView: function() {
		if ( 1 === this.props.mediaLibrarySelectedItems.length ) {
			// If this is the only selected item, return user to the list
			this.props.setView( ModalViews.LIST );
		} else if ( this.getDetailSelectedIndex() === this.props.mediaLibrarySelectedItems.length - 1 ) {
			// If this is the last selected item, decrement to the previous
			this.setDetailSelectedIndex( Math.max( this.getDetailSelectedIndex() - 1, 0 ) );
		}
	},

	confirmDeleteMedia: function( accepted ) {
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
		analytics.mc.bumpStat( 'editor_media_actions', 'delete_media' );
	},

	deleteMedia: function() {
		var selectedCount, confirmMessage;

		if ( ModalViews.DETAIL === this.props.view ) {
			selectedCount = 1;
		} else {
			selectedCount = this.props.mediaLibrarySelectedItems.length;
		}

		confirmMessage = this.translate(
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
		MediaActions.setLibrarySelectedItems( this.props.site.ID, [] );

		this.props.setView( ModalViews.IMAGE_EDITOR );
	},

	onImageEditorDone( error, blob, imageEditorProps ) {
		if ( error ) {
			this.onImageEditorCancel( imageEditorProps );

			return;
		}

		const {
			fileName,
			site,
			resetAllImageEditorState
		} = imageEditorProps;

		const mimeType = MediaUtils.getMimeType( fileName );

		// check if a title is already post-fixed with '(edited copy)'
		const editedCopyText = this.translate(
			'%(title)s (edited copy)', {
				args: {
					title: ''
				}
			} );

		let { title } = imageEditorProps;

		if ( title.indexOf( editedCopyText ) === -1 ) {
			title = this.translate(
				'%(title)s (edited copy)', {
					args: {
						title: title
					}
				} );
		}

		MediaActions.add( site.ID, {
			fileName: fileName,
			fileContents: blob,
			title: title,
			mimeType: mimeType
		} );

		resetAllImageEditorState();

		MediaActions.setLibrarySelectedItems( this.props.site.ID, [] );
		this.props.setView( ModalViews.LIST );
	},

	onImageEditorCancel: function( imageEditorProps ) {
		const { mediaLibrarySelectedItems } = this.props;

		const item = mediaLibrarySelectedItems[ this.getDetailSelectedIndex() ];

		if ( ! item ) {
			this.props.setView( ModalViews.LIST );
			return;
		}

		this.props.setView( ModalViews.DETAIL );

		const {	resetAllImageEditorState } = imageEditorProps;

		resetAllImageEditorState();
	},

	getDetailSelectedIndex() {
		const { mediaLibrarySelectedItems } = this.props;
		const { detailSelectedIndex } = this.state;
		if ( detailSelectedIndex >= mediaLibrarySelectedItems.length ) {
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
		const { site, mediaLibrarySelectedItems, single } = this.props;
		if ( ! site ) {
			return;
		}

		// Append item to set of selected items if not already selected.
		let items = mediaLibrarySelectedItems;
		if ( ! items.some( ( selected ) => selected.ID === item.ID ) ) {
			if ( single ) {
				items = [ item ];
			} else {
				items = items.concat( item );
			}
			MediaActions.setLibrarySelectedItems( site.ID, items );
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
			selectedItems = this.props.mediaLibrarySelectedItems,
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
						items={ this.props.mediaLibrarySelectedItems }
						selectedIndex={ this.getDetailSelectedIndex() }
						onSelectedIndexChange={ this.setDetailSelectedIndex } />
				);
				break;

			case ModalViews.GALLERY:
				content = (
					<MediaModalGallery
						site={ this.props.site }
						items={ this.props.mediaLibrarySelectedItems }
						settings={ this.state.gallerySettings }
						onUpdateSettings={ ( gallerySettings ) => this.setState( { gallerySettings } ) } />
				);
				break;

			case ModalViews.IMAGE_EDITOR:
				const {
					site,
					mediaLibrarySelectedItems: items
				} = this.props;

				const selectedIndex = this.getDetailSelectedIndex(),
					media = items ? items[ selectedIndex ] : null;

				content = (
					<ImageEditor
						siteId={ site && site.ID }
						media={ media }
						onDone={ this.onImageEditorDone }
						onCancel={ this.onImageEditorCancel }
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
	( state ) => ( {
		view: getMediaModalView( state )
	} ),
	{
		setView: setEditorMediaModalView,
		resetView: resetMediaModalView
	}
)( EditorMediaModal );
