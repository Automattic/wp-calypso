/**
 * External dependencies
 */
var React = require( 'react' ),
	clone = require( 'lodash/clone' ),
	noop = require( 'lodash/noop' ),
	filter = require( 'lodash/filter' ),
	findIndex = require( 'lodash/findIndex' );

import { AutoSizer, InfiniteLoader, Grid, WindowScroller } from 'react-virtualized';
import { connect } from 'react-redux';
import fill from 'lodash/fill';

/**
 * Internal dependencies
 */
var MediaActions = require( 'lib/media/actions' ),
	MediaUtils = require( 'lib/media/utils' ),
	ListItem = require( './list-item' ),
	ListNoResults = require( './list-no-results' ),
	ListNoContent = require( './list-no-content' );

import ListPlanUpgradeNudge from './list-plan-upgrade-nudge';
import { getPreference } from 'state/preferences/selectors';

export const MediaLibraryList = React.createClass( {
	displayName: 'MediaLibraryList',

	propTypes: {
		site: React.PropTypes.object,
		batchSize: React.PropTypes.number,
		media: React.PropTypes.arrayOf( React.PropTypes.object ),
		mediaLibrarySelectedItems: React.PropTypes.arrayOf( React.PropTypes.object ),
		filter: React.PropTypes.string,
		filterRequiresUpgrade: React.PropTypes.bool.isRequired,
		search: React.PropTypes.string,
		disableHeight: React.PropTypes.bool,
		mediaScale: React.PropTypes.number.isRequired,
		photon: React.PropTypes.bool,
		mediaHasNextPage: React.PropTypes.bool,
		mediaFetchingNextPage: React.PropTypes.bool,
		mediaOnFetchNextPage: React.PropTypes.func,
		single: React.PropTypes.bool,
		scrollable: React.PropTypes.bool,
		onEditItem: React.PropTypes.func,
		padding: React.PropTypes.number
	},

	getInitialState: function() {
		return {};
	},

	getDefaultProps: function() {
		return {
			batchSize: 20,
			media: [],
			mediaLibrarySelectedItems: Object.freeze( [] ),
			disableHeight: false,
			mediaHasNextPage: false,
			mediaFetchingNextPage: false,
			mediaOnFetchNextPage: noop,
			single: false,
			scrollable: false,
			onEditItem: noop,
			padding: 5
		};
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
			const interimIndex = findIndex( selectedItems, {
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
		const index = rowIndex * this._columnCount + columnIndex;
		const item = this._gridItems[ index ];

		style = {
			...style,
			fontSize: this.props.mediaScale * 225,
			top: style.top + this.props.padding,
			left: style.left + this.props.padding,
			width: style.width - this.props.padding * 2,
			height: style.height - this.props.padding * 2,
		};

		if ( ! item ) {
			return;
		}

		if ( item.loading ) {
			return (
				<ListItem
					key={ key }
					style={ style }
					scale={ this.props.mediaScale } />
			);
		}

		const selectedItems = this.props.mediaLibrarySelectedItems;
		const selectedIndex = findIndex( selectedItems, { ID: item.ID } );
		const showGalleryHelp = (
			! this.props.single &&
			selectedIndex !== -1 &&
			selectedItems.length === 1 &&
			'image' === MediaUtils.getMimePrefix( item )
		);

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

	createOnSectionRendered( onRowsRendered ) {
		const columnCount = this._columnCount;

		return function( { columnStartIndex, columnStopIndex, rowStartIndex, rowStopIndex } ) {
			const startIndex = rowStartIndex * columnCount + columnStartIndex;
			const stopIndex = rowStopIndex * columnCount + columnStopIndex;

			return onRowsRendered( { startIndex, stopIndex } );
		};
	},

	isRowLoaded: function( { index } ) {
		return !! this.props.media[ index ] || ! this.props.mediaHasNextPage;
	},

	loadMoreRows: function() {
		if ( ! this.props.mediaFetchingNextPage && this.props.mediaHasNextPage ) {
			// May be triggered while dispatching an action.
			// We cannot create a new action while dispatching an old one.
			setTimeout( this.props.mediaOnFetchNextPage );
		}
	},

	renderGrid: function( { height, onRowsRendered, registerChild, scrollTop, width } ) {
		const gridSize = Math.floor( width / this._columnCount );

		return (
			<Grid
				autoHeight={ this.props.disableHeight }
				cellRenderer={ this.renderItem }
				columnCount={ this._columnCount }
				columnWidth={ gridSize }
				height={ height }
				onSectionRendered={ this.createOnSectionRendered( onRowsRendered ) }
				ref={ registerChild }
				rowCount={ this._rowCount }
				rowHeight={ gridSize }
				scrollTop={ scrollTop }
				// Trigger update on change.
				selectedItems={ this.props.mediaLibrarySelectedItems }
				width={ width } />
		);
	},

	renderSizer: function( { onRowsRendered, registerChild } ) {
		if ( ! this.props.disableHeight ) {
			return (
				<AutoSizer>
					{ ( { height, width } ) => this.renderGrid( {
						onRowsRendered, registerChild,
						height, width
					} ) }
				</AutoSizer>
			);
		}

		return (
			<WindowScroller>
				{ ( { height, scrollTop } ) => (
					<AutoSizer disableHeight>
						{ ( { width } ) => this.renderGrid( {
							onRowsRendered, registerChild,
							height, scrollTop,
							width
						} ) }
					</AutoSizer>
				) }
			</WindowScroller>
		);
	},

	render: function() {
		if ( this.props.filterRequiresUpgrade ) {
			return <ListPlanUpgradeNudge filter={ this.props.filter } site={ this.props.site } />;
		}

		if ( ! this.props.mediaHasNextPage && this.props.media.length === 0 ) {
			return React.createElement( this.props.search ? ListNoResults : ListNoContent, {
				site: this.props.site,
				filter: this.props.filter,
				search: this.props.search
			} );
		}

		this._gridItems = this.props.media;

		if ( this.props.mediaHasNextPage ) {
			this._gridItems = this._gridItems.concat(
				fill( Array( this.props.batchSize ), { loading: true } )
			);
		}

		this._columnCount = Math.floor( 1 / this.props.mediaScale );
		this._rowCount = Math.ceil( this._gridItems.length / this._columnCount );

		return (
			<div className="media-library__list">
				<InfiniteLoader
					isRowLoaded={ this.isRowLoaded }
					loadMoreRows={ this.loadMoreRows }
					rowCount={ this._gridItems.length }
					threshold={ 1 }
					minimumBatchSize={ this.props.batchSize }>
					{ this.renderSizer }
				</InfiniteLoader>
			</div>
		);
	}
} );

export default connect( ( state ) => ( {
	mediaScale: getPreference( state, 'mediaScale' )
} ), null, null, { pure: false } )( MediaLibraryList );
