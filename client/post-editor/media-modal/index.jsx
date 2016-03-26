/**
 * External dependencies
 */
var React = require( 'react' ),
	noop = require( 'lodash/noop' ),
	head = require( 'lodash/head' ),
	some = require( 'lodash/some' ),
	findIndex = require( 'lodash/findIndex' ),
	values = require( 'lodash/values' ),
	closest = require( 'component-closest' ),
	debug = require( 'debug' )( 'calypso:post-editor:media' );

/**
 * Internal dependencies
 */
var MediaLibrary = require( 'my-sites/media-library' ),
	analytics = require( 'analytics' ),
	PostActions = require( 'lib/posts/actions' ),
	PostStats = require( 'lib/posts/stats' ),
	MediaModalSecondaryActions = require( './secondary-actions' ),
	MediaModalDetail = require( './detail' ),
	MediaModalGallery = require( './gallery' ),
	MediaActions = require( 'lib/media/actions' ),
	MediaUtils = require( 'lib/media/utils' ),
	Dialog = require( 'components/dialog' ),
	config = require( 'config' ),
	markup = require( './markup' ),
	accept = require( 'lib/accept' ),
	ModalViews = require( './constants' ).Views;

module.exports = React.createClass( {
	displayName: 'EditorMediaModal',

	propTypes: {
		visible: React.PropTypes.bool,
		initialActiveView: React.PropTypes.oneOf( values( ModalViews ) ),
		mediaLibrarySelectedItems: React.PropTypes.arrayOf( React.PropTypes.object ),
		onClose: React.PropTypes.func,
		onInsertMedia: React.PropTypes.func,
		site: React.PropTypes.object,
		labels: React.PropTypes.object,
		single: React.PropTypes.bool,
		defaultFilter: React.PropTypes.string,
		enabledFilters: React.PropTypes.arrayOf( React.PropTypes.string )
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
			labels: Object.freeze( {} )
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.site && this.props.visible && ! nextProps.visible ) {
			MediaActions.setLibrarySelectedItems( nextProps.site.ID, [] );
		}

		if ( ! nextProps.visible || this.props.visible === nextProps.visible ) {
			return;
		}

		this.replaceState( this.getDefaultState( nextProps ) );
	},

	componentDidMount: function() {
		debug( '%s component mounted.', this.constructor.name );

		this.statsTracking = {};
	},

	getDefaultState: function( props ) {
		return {
			filter: '',
			activeView: props.initialActiveView || ModalViews.LIST,
			detailSelectedIndex: 0,
			gallerySettings: props.initialGallerySettings
		};
	},

	isDisabled: function() {
		return some( this.props.mediaLibrarySelectedItems, function( item ) {
			var mimePrefix;

			if ( ! config.isEnabled( 'post-editor/live-image-updates' ) && item.transient ) {
				return true;
			}

			mimePrefix = MediaUtils.getMimePrefix( item );
			return item.transient && ( mimePrefix !== 'image' || ModalViews.GALLERY === this.state.activeView );
		}.bind( this ) );
	},

	confirmSelection: function() {
		var selectedItems = this.props.mediaLibrarySelectedItems,
			gallerySettings = this.state.gallerySettings,
			media, stat;

		if ( ! this.props.visible ) {
			return;
		}

		if ( ModalViews.GALLERY === this.state.activeView ) {
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

	setView: function( view ) {
		var stat;

		this.setState( {
			activeView: view
		} );

		switch ( view ) {
			case ModalViews.LIST: stat = 'view_list'; break;
			case ModalViews.DETAIL: stat = 'view_detail'; break;
			case ModalViews.GALLERY: stat = 'view_gallery'; break;
		}

		if ( stat ) {
			analytics.mc.bumpStat( 'editor_media_actions', stat );
		}
	},

	setDetailSelectedIndex: function( index ) {
		this.setState( {
			detailSelectedIndex: index
		} );
	},

	setNextAvailableDetailView: function() {
		if ( 1 === this.props.mediaLibrarySelectedItems.length ) {
			// If this is the only selected item, return user to the list
			this.setView( ModalViews.LIST );
		} else if ( this.state.detailSelectedIndex === this.props.mediaLibrarySelectedItems.length - 1 ) {
			// If this is the last selected item, decrement to the previous
			this.setDetailSelectedIndex( this.state.detailSelectedIndex - 1 );
		}
	},

	confirmDeleteMedia: function( accepted ) {
		var toDelete = this.props.mediaLibrarySelectedItems;

		if ( ! this.props.site || ! accepted ) {
			return;
		}

		if ( ModalViews.DETAIL === this.state.activeView ) {
			toDelete = MediaUtils.sortItemsByDate( toDelete )[ this.state.detailSelectedIndex ];
			this.setNextAvailableDetailView();
		}

		MediaActions.delete( this.props.site.ID, toDelete );
		analytics.mc.bumpStat( 'editor_media_actions', 'delete_media' );
	},

	deleteMedia: function() {
		var selectedCount, confirmMessage;

		if ( ModalViews.DETAIL === this.state.activeView ) {
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
		const { site, mediaLibrarySelectedItems } = this.props;
		if ( ! site ) {
			return;
		}

		// Append item to set of selected items if not already selected.
		let items = mediaLibrarySelectedItems;
		if ( ! items.some( ( selected ) => selected.ID === item.ID ) ) {
			items = items.concat( item );
			MediaActions.setLibrarySelectedItems( site.ID, items );
		}

		// The detail view sorts items by dates, so to ensure proper selected
		// index is set, first sort the selected set
		const sortedItems = MediaUtils.sortItemsByDate( items );
		this.setDetailSelectedIndex( findIndex( sortedItems, { ID: item.ID } ) );

		analytics.mc.bumpStat( 'editor_media_actions', 'edit_button_contextual' );
		analytics.ga.recordEvent( 'Media', 'Clicked Contextual Edit Button' );

		this.setView( ModalViews.DETAIL );
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

		buttons = [
			<MediaModalSecondaryActions
				site={ this.props.site }
				selectedItems={ selectedItems }
				activeView={ this.state.activeView }
				disabled={ isDisabled }
				onDelete={ this.deleteMedia }
				onChangeView={ this.setView } />,
			{
				action: 'cancel',
				label: this.translate( 'Cancel' )
			}
		];

		if ( ModalViews.GALLERY !== this.state.activeView && selectedItems.length > 1 &&
				! some( selectedItems, ( item ) => MediaUtils.getMimePrefix( item ) !== 'image' ) ) {
			buttons.push( {
				action: 'confirm',
				label: this.translate( 'Continue' ),
				isPrimary: true,
				disabled: isDisabled || ! this.props.site,
				onClick: this.setView.bind( this, ModalViews.GALLERY )
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

	preventPopoverClose: function( event ) {
		if ( closest( event.target, '.popover.is-dialog-visible' ) ) {
			return true;
		}
	},

	renderContent: function() {
		var content;

		switch ( this.state.activeView ) {
			case ModalViews.LIST:
				content = (
					<MediaLibrary
						site={ this.props.site }
						filter={ this.state.filter || this.props.defaultFilter || this.getFirstEnabledFilter() }
						enabledFilters={ this.props.enabledFilters }
						search={ this.state.search }
						onAddMedia={ this.onAddMedia }
						onFilterChange={ this.onFilterChange }
						onScaleChange={ this.onScaleChange }
						onSearch={ this.onSearch }
						onEditItem={ this.editItem }
						fullScreenDropZone={ false }
						single={ this.props.single }
						scrollable />
				);
				break;

			case ModalViews.DETAIL:
				content = (
					<MediaModalDetail
						site={ this.props.site }
						items={ this.props.mediaLibrarySelectedItems }
						selectedIndex={ this.state.detailSelectedIndex }
						onSelectedIndexChange={ this.setDetailSelectedIndex }
						onChangeView={ this.setView } />
				);
				break;

			case ModalViews.GALLERY:
				content = (
					<MediaModalGallery
						site={ this.props.site }
						items={ this.props.mediaLibrarySelectedItems }
						settings={ this.state.gallerySettings }
						onUpdateSettings={ ( gallerySettings ) => this.setState( { gallerySettings } ) }
						onChangeView={ this.setView } />
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
				onClickOutside={ this.preventPopoverClose }>
				{ this.renderContent() }
			</Dialog>
		);
	}
} );
