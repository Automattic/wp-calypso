/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	clone = require( 'lodash/clone' ),
	noop = require( 'lodash/noop' ),
	filter = require( 'lodash/filter' ),
	findIndex = require( 'lodash/findIndex' );

import { AutoSizer, InfiniteLoader, Grid } from 'react-virtualized';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
var MediaActions = require( 'lib/media/actions' ),
	MediaUtils = require( 'lib/media/utils' ),
	ListItem = require( './list-item' ),
	ListNoResults = require( './list-no-results' ),
	ListNoContent = require( './list-no-content' ),
	user = require( 'lib/user' )();

import ListPlanUpgradeNudge from './list-plan-upgrade-nudge';
import { getPreference } from 'state/preferences/selectors';

export const MediaLibraryList = React.createClass( {
	displayName: 'MediaLibraryList',

	propTypes: {
		site: React.PropTypes.object,
		media: React.PropTypes.arrayOf( React.PropTypes.object ),
		mediaLibrarySelectedItems: React.PropTypes.arrayOf( React.PropTypes.object ),
		filter: React.PropTypes.string,
		filterRequiresUpgrade: React.PropTypes.bool.isRequired,
		search: React.PropTypes.string,
		containerWidth: React.PropTypes.number,
		rowPadding: React.PropTypes.number,
		mediaScale: React.PropTypes.number.isRequired,
		photon: React.PropTypes.bool,
		mediaHasNextPage: React.PropTypes.bool,
		mediaFetchingNextPage: React.PropTypes.bool,
		mediaOnFetchNextPage: React.PropTypes.func,
		single: React.PropTypes.bool,
		scrollable: React.PropTypes.bool,
		onEditItem: React.PropTypes.func
	},

	getInitialState: function() {
		return {};
	},

	getDefaultProps: function() {
		return {
			mediaLibrarySelectedItems: Object.freeze( [] ),
			containerWidth: 0,
			rowPadding: 10,
			mediaHasNextPage: false,
			mediaFetchingNextPage: false,
			mediaOnFetchNextPage: noop,
			single: false,
			scrollable: false,
			onEditItem: noop
		};
	},

	componentWillMount() {
		if ( ! this.props.media ) {
			this.props.mediaOnFetchNextPage();
		}
	},

	setListContext( component ) {
		if ( ! component ) {
			return;
		}

		this.setState( {
			listContext: ReactDom.findDOMNode( component )
		} );
	},

	getItemsPerRow: function() {
		return Math.floor( 1 / this.props.mediaScale );
	},

	toggleItem: function( item, shiftKeyPressed ) {
		// We don't care to preserve the existing selected items if we're only
		// seeking to select a single item
		let selectedItems;
		if ( this.props.single ) {
			selectedItems = filter( this.props.mediaLibrarySelectedItems, { ID: item.ID } );
		} else {
			selectedItems = clone( this.props.mediaLibrarySelectedItems );
		}

		const selectedItemsIndex = findIndex( selectedItems, { ID: item.ID } );
		const isToBeSelected = ( -1 === selectedItemsIndex );
		const selectedMediaIndex = findIndex( this.props.media, { ID: item.ID } );

		let start = selectedMediaIndex;
		let end = selectedMediaIndex;

		if ( ! this.props.single && shiftKeyPressed ) {
			start = Math.min( start, this.state.lastSelectedMediaIndex );
			end = Math.max( end, this.state.lastSelectedMediaIndex );
		}

		for ( let i = start; i <= end; i++ ) {
			let interimIndex = findIndex( selectedItems, {
				ID: this.props.media[ i ].ID
			} );

			if ( isToBeSelected && -1 === interimIndex ) {
				selectedItems.push( this.props.media[ i ] );
			} else if ( ! isToBeSelected && -1 !== interimIndex ) {
				selectedItems.splice( interimIndex, 1 );
			}
		}

		this.setState( {
			lastSelectedMediaIndex: selectedMediaIndex
		} );

		if ( this.props.site ) {
			MediaActions.setLibrarySelectedItems( this.props.site.ID, selectedItems );
		}
	},

	renderItem: function( { rowIndex, columnIndex, key, style } ) {
		var media = this.props.media || [];
		var index = ( rowIndex * this.getItemsPerRow() ) + columnIndex;
		var item = media[ index ];

		if ( ! item ) {
			return (
				<div key={ key } style={ style } />
			);
		}

		var selectedItems = this.props.mediaLibrarySelectedItems;
		var selectedIndex = findIndex( selectedItems, { ID: item.ID } );
		var showGalleryHelp = (
			! this.props.single &&
			selectedIndex !== -1 &&
			selectedItems.length === 1 &&
			'image' === MediaUtils.getMimePrefix( item )
		);

		style.fontSize = this.props.mediaScale * 225;

		return (
			<ListItem
				key={ key }
				style={ style }
				media={ item }
				scale={ this.props.mediaScale }
				photon={ this.props.photon }
				showGalleryHelp={ showGalleryHelp }
				selectedIndex={ selectedIndex }
				onToggle={ this.toggleItem }
				onEditItem={ this.props.onEditItem } />
		);
	},

	renderLoadingPlaceholders: function() {
		var itemsPerRow = this.getItemsPerRow(),
			itemsVisible = ( this.props.media || [] ).length,
			placeholders = itemsPerRow - ( itemsVisible % itemsPerRow );

		// We render enough placeholders to occupy the remainder of the row
		return Array.apply( null, new Array( placeholders ) ).map( function( value, i ) {
			return (
				<ListItem
					key={ 'placeholder-' + i }
					scale={ this.props.mediaScale } />
			);
		}, this );
	},

	isRowLoaded: function( { index } ) {
		console.log( 'isRowLoaded', index );

		return !! this.props.media[ index ];
	},

	loadMoreRows: function( { startIndex, stopIndex } ) {
		console.log( `Loading rows ${startIndex} - ${stopIndex}.` );

		// InfiniteList passes its own parameter which would interfere
		// with the optional parameters expected by mediaOnFetchNextPage
		this.props.mediaOnFetchNextPage();
	},

	render: function() {
		if ( this.props.filterRequiresUpgrade ) {
			return <ListPlanUpgradeNudge filter={ this.props.filter } site={ this.props.site } />;
		}

		var media = this.props.media || [];

		if ( ! this.props.mediaHasNextPage && media.length === 0 ) {
			return React.createElement( this.props.search ? ListNoResults : ListNoContent, {
				site: this.props.site,
				filter: this.props.filter,
				search: this.props.search
			} );
		}

		var columnCount = this.getItemsPerRow();
		var rowCount = Math.ceil( media.length / columnCount );

		return (
			<div className="media-library__list">
				<InfiniteLoader
					isRowLoaded={ this.isRowLoaded }
					loadMoreRows={ this.loadMoreRows }
					rowCount={ 1000 }
					threshold={ 1 }>
					{ ( { onRowsRendered, registerChild } ) => (
						<AutoSizer>
							{ ( { height, width } ) => (
								<Grid
									width={ width }
									height={ height }
									columnCount={ columnCount }
									columnWidth={ Math.floor( width / columnCount ) }
									rowCount={ rowCount }
									rowHeight={ Math.floor( width / columnCount ) }
									cellRenderer={ this.renderItem }
									onRowsRendered={ onRowsRendered }
									ref={ registerChild }
									// Trigger update on change.
									selectedItems={ this.props.mediaLibrarySelectedItems } />
							)}
						</AutoSizer>
					) }
				</InfiniteLoader>
			</div>
		);
	}
} );

export default connect( ( state ) => ( {
	mediaScale: getPreference( state, 'mediaScale' )
} ), null, null, { pure: false } )( MediaLibraryList );
