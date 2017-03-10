/**
 * External dependencies
 */
var React = require( 'react' ),
	clone = require( 'lodash/clone' ),
	noop = require( 'lodash/noop' ),
	filter = require( 'lodash/filter' ),
	findIndex = require( 'lodash/findIndex' );

import AutoSizer from 'react-virtualized/AutoSizer';
import InfiniteLoader from 'react-virtualized/InfiniteLoader';
import Grid from 'react-virtualized/Grid';
import WindowScroller from 'react-virtualized/WindowScroller';
import { connect } from 'react-redux';
import { fill } from 'lodash';
import { localize } from 'i18n-calypso';

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
		padding: React.PropTypes.number,
		headingHeight: React.PropTypes.number
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
			padding: 5,
			headingHeight: 50
		};
	},

	setRef: function( ref ) {
		this.grid = ref;
		this._registerChild( ref );
	},

	componentWillUpdate: function( props ) {
		if ( this.grid && props.media.length > this.props.media.length ) {
			this.grid.recomputeGridSize();
		}
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

		if ( ! item ) {
			return;
		}

		style = {
			...style,
			top: style.top + this.props.padding,
			left: style.left + this.props.padding,
			width: 'heading' in item
				? style.width * this._columnCount - this.props.padding * 2
				: style.width - this.props.padding * 2,
			height: style.height - this.props.padding * 2,
		};

		if ( 'heading' in item ) {
			return (
				<h3 key={ key } style={ style }><span>{ item.heading }</span></h3>
			);
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

	onSectionRendered: function( { columnStartIndex, columnStopIndex, rowStartIndex, rowStopIndex } ) {
		const startIndex = rowStartIndex * this._columnCount + columnStartIndex;
		const stopIndex = rowStopIndex * this._columnCount + columnStopIndex;

		return this._onRowsRendered( { startIndex, stopIndex } );
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

	renderGrid: function( { height, scrollTop, width } ) {
		this._gridSize = Math.floor( width / this._columnCount );

		return (
			<Grid
				autoHeight={ this.props.disableHeight }
				cellRenderer={ this.renderItem }
				columnCount={ this._columnCount }
				columnWidth={ this._gridSize }
				height={ height }
				onSectionRendered={ this.onSectionRendered }
				ref={ this.setRef }
				rowCount={ this._rowCount }
				rowHeight={ this.getRowHeight }
				scrollTop={ scrollTop }
				// Trigger update on change.
				selectedItems={ this.props.mediaLibrarySelectedItems }
				// Never show a hortizontal scrollbar.
				style={ { overflowX: 'hidden' } }
				width={ width } />
		);
	},

	renderSizer: function( { onRowsRendered, registerChild } ) {
		this._onRowsRendered = onRowsRendered;
		this._registerChild = registerChild;

		if ( ! this.props.disableHeight ) {
			return (
				<AutoSizer>
					{ ( { height, width } ) => this.renderGrid( {
						registerChild,
						height,
						width
					} ) }
				</AutoSizer>
			);
		}

		return (
			<WindowScroller>
				{ ( { height, scrollTop } ) => (
					<AutoSizer disableHeight>
						{ ( { width } ) => this.renderGrid( {
							registerChild,
							height,
							scrollTop,
							width
						} ) }
					</AutoSizer>
				) }
			</WindowScroller>
		);
	},

	getRowHeight: function( { index } ) {
		const item = this._gridItems[ index * this._columnCount ];

		if ( item && 'heading' in item ) {
			return this.props.headingHeight;
		}

		return this._gridSize;
	},

	formatDate: function( moment ) {
		const { translate } = this.props;
		const today = this.props.moment().startOf( 'day' );
		const yesterday = today.clone().subtract( 1, 'day' );
		const oneWeekAgo = today.clone().subtract( 7, 'days' );
		const oneYearAgo = today.clone().subtract( 1, 'year' );

		if ( moment.isSame( today, 'day' ) ) {
			return translate( 'Today' );
		} else if ( moment.isSame( yesterday, 'day' ) ) {
			return translate( 'Yesterday' );
		} else if ( moment.isAfter( oneWeekAgo, 'day' ) ) {
			return moment.format( 'dddd' );
		} else if ( moment.isAfter( oneYearAgo, 'day' ) ) {
			return moment.format( translate( '%(month)s %(day)s', {
				comment: 'Date format.',
				args: { day: 'D', month: 'MMMM' }
			} ) );
		}

		return moment.format( 'LL' );
	},

	getGridItems: function() {
		const items = [];

		this.props.media.forEach( ( item, index, media ) => {
			const itemMoment = this.props.moment( item.date );

			// If it's the first item or the day has changed, add a heading.
			if ( ! index || ! itemMoment.isSame( media[ index - 1 ].date, 'day' ) ) {
				// Amount of items that don't fill an entire row.
				const trailing = items.length % this._columnCount;

				// Fill the last row with empty slots.
				if ( trailing ) {
					items.push( ...Array( this._columnCount - trailing ) );
				}

				// Add a heading with the date.
				items.push( {
					heading: this.formatDate( itemMoment ),
				} );

				// Fill the rest of the row with empty slots.
				items.push( ...Array( this._columnCount - 1 ) );
			}

			items.push( item );
		} );

		// If there are no media, add a placeholder heading.
		if ( ! this.props.media.length ) {
			items.push( {
				heading: '',
			} );

			// Fill the rest of the row with empty slots.
			items.push( ...Array( this._columnCount - 1 ) );
		}

		// If there is more media to come, show placeholders for them.
		if ( this.props.mediaHasNextPage ) {
			items.push( ...fill( Array( this.props.batchSize ), {
				loading: true
			} ) );
		}

		return items;
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

		this._columnCount = Math.floor( 1 / this.props.mediaScale );
		this._gridItems = this.getGridItems();
		this._rowCount = Math.ceil( this._gridItems.length / this._columnCount );

		return (
			<div className="media-library__list">
				<InfiniteLoader
					isRowLoaded={ this.isRowLoaded }
					loadMoreRows={ this.loadMoreRows }
					rowCount={ this._gridItems.length }
					threshold={ 5 * this._columnCount }
					minimumBatchSize={ this.props.batchSize }>
					{ ( args ) => this.renderSizer( args ) }
				</InfiniteLoader>
			</div>
		);
	}
} );

export default connect( ( state ) => ( {
	mediaScale: getPreference( state, 'mediaScale' )
} ), null, null, { pure: false } )( localize( MediaLibraryList ) );
