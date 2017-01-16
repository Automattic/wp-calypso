/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	clone = require( 'lodash/clone' ),
	noop = require( 'lodash/noop' ),
	filter = require( 'lodash/filter' ),
	findIndex = require( 'lodash/findIndex' );

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
var MediaUtils = require( 'lib/media/utils' ),
	ListItem = require( './list-item' ),
	ListNoResults = require( './list-no-results' ),
	ListNoContent = require( './list-no-content' ),
	InfiniteList = require( 'components/infinite-list' ),
	user = require( 'lib/user' )();

import ListPlanUpgradeNudge from './list-plan-upgrade-nudge';
import QueryMedia from 'components/data/query-media';
import { getPreference } from 'state/preferences/selectors';
import {
	getMediaItemsForQuery,
	isRequestingMediaItems,
	getMediaItemsFoundForQuery,
	getSelectedMediaIds
} from 'state/media/selectors';
import {
	selectMediaItems
} from 'state/media/actions';
import { getMimeBaseTypeFromFilter } from 'components/data/media-list-data/utils';

export const MediaLibraryList = React.createClass( {
	displayName: 'MediaLibraryList',

	propTypes: {
		site: React.PropTypes.object,
		media: React.PropTypes.arrayOf( React.PropTypes.object ),
		selected: React.PropTypes.arrayOf( React.PropTypes.number ),
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
		return {
			pages: [ 1 ]
		};
	},

	getDefaultProps: function() {
		return {
			selected: Object.freeze( [] ),
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

	setListContext( component ) {
		if ( ! component ) {
			return;
		}

		this.setState( {
			listContext: ReactDom.findDOMNode( component )
		} );
	},

	getMediaItemHeight: function() {
		return Math.round( this.props.containerWidth * this.props.mediaScale ) + this.props.rowPadding;
	},

	getItemsPerRow: function() {
		return Math.floor( 1 / this.props.mediaScale );
	},

	getMediaItemStyle: function( index ) {
		var itemsPerRow = this.getItemsPerRow(),
			isFillingEntireRow = itemsPerRow === 1 / this.props.mediaScale,
			isLastInRow = 0 === ( index + 1 ) % itemsPerRow,
			style, marginValue;

		style = {
			paddingBottom: this.props.rowPadding,
			fontSize: this.props.mediaScale * 225
		};

		if ( ! isFillingEntireRow && ! isLastInRow ) {
			marginValue = ( 1 % this.props.mediaScale ) / ( itemsPerRow - 1 ) * 100 + '%';

			if ( user.isRTL() ) {
				style.marginLeft = marginValue;
			} else {
				style.marginRight = marginValue;
			}
		}

		return style;
	},

	toggleItem: function( item, shiftKeyPressed ) {
		// We don't care to preserve the existing selected items if we're only
		// seeking to select a single item
		let selectedItems;

		if ( this.props.single ) {
			selectedItems = filter( this.props.selected, item.ID );
		} else {
			selectedItems = clone( this.props.selected );
		}

		const selectedItemsIndex = selectedItems.indexOf( item.ID );
		const isToBeSelected = ( -1 === selectedItemsIndex );
		const selectedMediaIndex = findIndex( this.props.media, { ID: item.ID } );

		let start = selectedMediaIndex;
		let end = selectedMediaIndex;

		if ( ! this.props.single && shiftKeyPressed ) {
			start = Math.min( start, this.state.lastSelectedMediaIndex );
			end = Math.max( end, this.state.lastSelectedMediaIndex );
		}

		for ( let i = start; i <= end; i++ ) {
			let interimIndex = selectedItems.indexOf( this.props.media[ i ].ID );

			if ( isToBeSelected && -1 === interimIndex ) {
				selectedItems.push( this.props.media[ i ].ID );
			} else if ( ! isToBeSelected && -1 !== interimIndex ) {
				selectedItems.splice( interimIndex, 1 );
			}
		}

		this.setState( {
			lastSelectedMediaIndex: selectedMediaIndex
		} );

		if ( this.props.site ) {
			this.props.selectMediaItems( this.props.site.ID, selectedItems );
		}
	},

	getItemRef: function( item ) {
		return 'item-' + item.ID;
	},

	renderItem: function( item ) {
		var index = findIndex( this.props.media, { ID: item.ID } ),
			selectedIndex = this.props.selected.indexOf( item.ID ),
			ref = this.getItemRef( item ),
			showGalleryHelp;

		showGalleryHelp = (
			! this.props.single &&
			selectedIndex !== -1 &&
			this.props.selected.length === 1 &&
			'image' === MediaUtils.getMimePrefix( item )
		);

		return (
			<ListItem
				ref={ ref }
				key={ ref }
				style={ this.getMediaItemStyle( index ) }
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
					style={ this.getMediaItemStyle( itemsVisible + i ) }
					scale={ this.props.mediaScale } />
			);
		}, this );
	},

	fetchNextPage: function() {
		this.setState( {
			pages: [
				...this.state.pages,
				this.state.pages.length + 1
			]
		} );
	},

	render: function() {
		if ( this.props.filterRequiresUpgrade ) {
			return <ListPlanUpgradeNudge filter={ this.props.filter } site={ this.props.site } />;
		}

		if ( this.props.foundMedia === 0 ) {
			return React.createElement( this.props.search ? ListNoResults : ListNoContent, {
				site: this.props.site,
				filter: this.props.filter,
				search: this.props.search
			} );
		}

		const search = this.props.search;
		const mime_type = getMimeBaseTypeFromFilter( this.props.filter );
		const media = this.props.media || [];

		return (
			<div>
				{ this.state.pages.map( page => (
					<QueryMedia
						key={ `query-media-${ page }` }
						siteId={ this.props.site.ID }
						query={ { search, mime_type, page } } />
				) ) }
				<InfiniteList
					ref={ this.setListContext }
					context={ this.props.scrollable ? this.state.listContext : false }
					items={ media }
					itemsPerRow={ this.getItemsPerRow() }
					lastPage={ media.length === this.props.found }
					fetchingNextPage={ this.props.requesting || false }
					guessedItemHeight={ this.getMediaItemHeight() }
					fetchNextPage={ this.fetchNextPage }
					getItemRef={ this.getItemRef }
					renderItem={ this.renderItem }
					renderLoadingPlaceholders={ this.renderLoadingPlaceholders }
					className="media-library__list" />
			</div>
		);
	}
} );

export default connect(
	( state, ownProps ) => {
		const query = {
			search: ownProps.search,
			mime_type: getMimeBaseTypeFromFilter( ownProps.filter )
		};

		return {
			mediaScale: getPreference( state, 'mediaScale' ),
			media: getMediaItemsForQuery( state, ownProps.site.ID, query ),
			requesting: isRequestingMediaItems( state, ownProps.site.ID, query ),
			found: getMediaItemsFoundForQuery( state, ownProps.site.ID, query ),
			selected: getSelectedMediaIds( state, ownProps.site.ID )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			selectMediaItems
		}, dispatch );
	},
	null,
	{ pure: false }
)( MediaLibraryList );
