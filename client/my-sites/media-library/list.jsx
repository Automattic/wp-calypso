/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRtl } from 'i18n-calypso';
import { clone, filter, findIndex, min, noop } from 'lodash';
import ReactDom from 'react-dom';
import React from 'react';

/**
 * Internal dependencies
 */
import MediaActions from 'lib/media/actions';
import { getMimePrefix } from 'lib/media/utils';
import ListItem from './list-item';
import ListNoResults from './list-no-results';
import ListNoContent from './list-no-content';
import ListPlanUpgradeNudge from './list-plan-upgrade-nudge';
import SortedGrid from 'components/sorted-grid';
import { withLocalizedMoment } from 'components/localized-moment';
import { getPreference } from 'state/preferences/selectors';

export class MediaLibraryList extends React.Component {
	static displayName = 'MediaLibraryList';

	static propTypes = {
		site: PropTypes.object,
		media: PropTypes.arrayOf( PropTypes.object ),
		mediaLibrarySelectedItems: PropTypes.arrayOf( PropTypes.object ),
		filter: PropTypes.string,
		filterRequiresUpgrade: PropTypes.bool.isRequired,
		search: PropTypes.string,
		containerWidth: PropTypes.number,
		rowPadding: PropTypes.number,
		mediaScale: PropTypes.number.isRequired,
		thumbnailType: PropTypes.string,
		mediaHasNextPage: PropTypes.bool,
		mediaFetchingNextPage: PropTypes.bool,
		mediaOnFetchNextPage: PropTypes.func,
		single: PropTypes.bool,
		scrollable: PropTypes.bool,
		onEditItem: PropTypes.func,
	};

	static defaultProps = {
		mediaLibrarySelectedItems: Object.freeze( [] ),
		containerWidth: 0,
		rowPadding: 10,
		mediaHasNextPage: false,
		mediaFetchingNextPage: false,
		mediaOnFetchNextPage: noop,
		single: false,
		scrollable: false,
		onEditItem: noop,
	};

	state = {};

	setListContext = ( component ) => {
		if ( ! component ) {
			return;
		}

		this.setState( {
			listContext: ReactDom.findDOMNode( component ),
		} );
	};

	getMediaItemHeight = () => {
		return Math.round( this.props.containerWidth * this.props.mediaScale ) + this.props.rowPadding;
	};

	getItemsPerRow = () => {
		return Math.floor( 1 / this.props.mediaScale );
	};

	getMediaItemStyle = ( index ) => {
		const itemsPerRow = this.getItemsPerRow();
		const isFillingEntireRow = itemsPerRow === 1 / this.props.mediaScale;
		const isLastInRow = 0 === ( index + 1 ) % itemsPerRow;
		const style = {
			paddingBottom: this.props.rowPadding,
			fontSize: this.props.mediaScale * 225,
		};

		if ( ! isFillingEntireRow && ! isLastInRow ) {
			const marginValue = ( ( 1 % this.props.mediaScale ) / ( itemsPerRow - 1 ) ) * 100 + '%';

			const { isRtl } = this.props;

			if ( isRtl ) {
				style.marginLeft = marginValue;
			} else {
				style.marginRight = marginValue;
			}
		}

		return style;
	};

	toggleItem = ( item, shiftKeyPressed ) => {
		// We don't care to preserve the existing selected items if we're only
		// seeking to select a single item
		let selectedItems;
		if ( this.props.single ) {
			selectedItems = filter( this.props.mediaLibrarySelectedItems, { ID: item.ID } );
		} else {
			selectedItems = clone( this.props.mediaLibrarySelectedItems );
		}

		const selectedItemsIndex = findIndex( selectedItems, { ID: item.ID } );
		const isToBeSelected = -1 === selectedItemsIndex;
		const selectedMediaIndex = findIndex( this.props.media, { ID: item.ID } );

		let start = selectedMediaIndex;
		let end = selectedMediaIndex;

		if ( ! this.props.single && shiftKeyPressed ) {
			start = Math.min( start, this.state.lastSelectedMediaIndex );
			end = Math.max( end, this.state.lastSelectedMediaIndex );
		}

		for ( let i = start; i <= end; i++ ) {
			const interimIndex = findIndex( selectedItems, {
				ID: this.props.media[ i ].ID,
			} );

			if ( isToBeSelected && -1 === interimIndex ) {
				selectedItems.push( this.props.media[ i ] );
			} else if ( ! isToBeSelected && -1 !== interimIndex ) {
				selectedItems.splice( interimIndex, 1 );
			}
		}

		this.setState( {
			lastSelectedMediaIndex: selectedMediaIndex,
		} );

		if ( this.props.site ) {
			MediaActions.setLibrarySelectedItems( this.props.site.ID, selectedItems );
		}
	};

	getItemRef = ( item ) => {
		return 'item-' + item.ID;
	};

	getGroupLabel = ( date ) => {
		const itemDate = new Date( date );
		const currentDate = new Date();

		if ( itemDate.getFullYear() === currentDate.getFullYear() ) {
			return this.props.moment( date ).format( 'MMM D' );
		}

		return this.props.moment( date ).format( 'MMM D, YYYY' );
	};

	getItemGroup = ( item ) =>
		min( [ item.date.slice( 0, 10 ), this.props.moment( new Date() ).format( 'YYYY-MM-DD' ) ] );

	renderItem = ( item ) => {
		const index = findIndex( this.props.media, { ID: item.ID } );
		const selectedItems = this.props.mediaLibrarySelectedItems;
		const selectedIndex = findIndex( selectedItems, { ID: item.ID } );
		const ref = this.getItemRef( item );

		const showGalleryHelp =
			! this.props.single &&
			selectedIndex !== -1 &&
			selectedItems.length === 1 &&
			'image' === getMimePrefix( item );

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
				onEditItem={ this.props.onEditItem }
			/>
		);
	};

	renderLoadingPlaceholders = () => {
		const itemsPerRow = this.getItemsPerRow();
		const itemsVisible = ( this.props.media || [] ).length;
		const placeholders = itemsPerRow - ( itemsVisible % itemsPerRow );

		// We render enough placeholders to occupy the remainder of the row
		return Array.apply( null, new Array( placeholders ) ).map( function ( value, i ) {
			return (
				<ListItem
					key={ 'placeholder-' + i }
					style={ this.getMediaItemStyle( itemsVisible + i ) }
					scale={ this.props.mediaScale }
				/>
			);
		}, this );
	};

	sourceIsUngrouped( source ) {
		const ungroupedSources = [ 'pexels' ];
		return -1 !== ungroupedSources.indexOf( source );
	}

	render() {
		let getItemGroup = this.getItemGroup;
		let getGroupLabel = this.getGroupLabel;

		if ( this.props.filterRequiresUpgrade ) {
			return <ListPlanUpgradeNudge filter={ this.props.filter } site={ this.props.site } />;
		}

		if ( ! this.props.mediaHasNextPage && this.props.media && 0 === this.props.media.length ) {
			return React.createElement( this.props.search ? ListNoResults : ListNoContent, {
				site: this.props.site,
				filter: this.props.filter,
				search: this.props.search,
				source: this.props.source,
			} );
		}

		const onFetchNextPage = function () {
			// InfiniteList passes its own parameter which would interfere
			// with the optional parameters expected by mediaOnFetchNextPage
			this.props.mediaOnFetchNextPage();
		}.bind( this );

		// some sources aren't grouped beyond anything but the source, so set the
		// getItemGroup function to return the source, and no label.
		if ( this.sourceIsUngrouped( this.props.source ) ) {
			getItemGroup = () => this.props.source;
			getGroupLabel = () => '';
		}

		return (
			<SortedGrid
				ref={ this.setListContext }
				getItemGroup={ getItemGroup }
				getGroupLabel={ getGroupLabel }
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
				className="media-library__list"
			/>
		);
	}
}

export default connect( ( state ) => ( {
	mediaScale: getPreference( state, 'mediaScale' ),
} ) )( withRtl( withLocalizedMoment( MediaLibraryList ) ) );
