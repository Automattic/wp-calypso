/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	clone = require( 'lodash/clone' ),
	noop = require( 'lodash/noop' ),
	filter = require( 'lodash/filter' ),
	findIndex = require( 'lodash/findIndex' );

import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
var MediaActions = require( 'lib/media/actions' ),
	MediaUtils = require( 'lib/media/utils' ),
	ListItem = require( './list-item' ),
	ListNoResults = require( './list-no-results' ),
	ListNoContent = require( './list-no-content' ),
	InfiniteList = require( 'components/infinite-list' ),
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
		thumbnailType: React.PropTypes.string,
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

	getItemRef: function( item ) {
		return 'item-' + item.ID;
	},

	renderItem: function( item ) {
		var index = findIndex( this.props.media, { ID: item.ID } ),
			selectedItems = this.props.mediaLibrarySelectedItems,
			selectedIndex = findIndex( selectedItems, { ID: item.ID } ),
			ref = this.getItemRef( item ),
			showGalleryHelp;

		showGalleryHelp = (
			! this.props.single &&
			selectedIndex !== -1 &&
			selectedItems.length === 1 &&
			'image' === MediaUtils.getMimePrefix( item )
		);

		return (
			<ListItem
				ref={ ref }
				key={ ref }
				style={ this.getMediaItemStyle( index ) }
				media={ item }
				scale={ this.props.mediaScale }
				thumbnailType={ this.props.thumbnailType }
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

	render: function() {
		var onFetchNextPage;

		if ( this.props.filterRequiresUpgrade ) {
			return <ListPlanUpgradeNudge filter={ this.props.filter } site={ this.props.site } />;
		}

		if ( ! this.props.mediaHasNextPage && this.props.media && 0 === this.props.media.length ) {
			return React.createElement( this.props.search ? ListNoResults : ListNoContent, {
				site: this.props.site,
				filter: this.props.filter,
				search: this.props.search
			} );
		}

		onFetchNextPage = function() {
			// InfiniteList passes its own parameter which would interfere
			// with the optional parameters expected by mediaOnFetchNextPage
			this.props.mediaOnFetchNextPage();
		}.bind( this );

		return (
			<InfiniteList
				ref={ this.setListContext }
				context={ this.props.scrollable ? this.state.listContext : false }
				items={ this.props.media || [] }
				itemsPerRow={ this.getItemsPerRow() }
				lastPage={ ! this.props.mediaHasNextPage }
				fetchingNextPage={ this.props.mediaFetchingNextPage }
				guessedItemHeight={ this.getMediaItemHeight() }
				fetchNextPage={ onFetchNextPage }
				getItemRef={ this.getItemRef }
				renderItem={ this.renderItem }
				renderLoadingPlaceholders={ this.renderLoadingPlaceholders }
				className="media-library__list" />
		);
	}
} );

export default connect( ( state ) => ( {
	mediaScale: getPreference( state, 'mediaScale' )
} ), null, null, { pure: false } )( MediaLibraryList );
