// External dependencies
import React from 'react';
import times from 'lodash/times';
import debugModule from 'debug';

// Internal dependencies
import InfiniteList from 'components/infinite-list';
import ReaderListsStore from 'lib/reader-lists/lists';
import ReaderListsItemsStore from 'lib/reader-lists-items/store';
import { fetchMoreItems } from 'lib/reader-lists-items/actions';
import smartSetState from 'lib/react-smart-set-state';
import ListManagementError from '../error';
import EmptyContent from 'components/empty-content';
import ListManagementSitesListItem from './list-item';
import Placeholder from 'reader/following-edit/placeholder';

const debug = debugModule( 'calypso:reader:list-management' ); // eslint-disable-line
const stats = require( 'reader/stats' );

const ListManagementSites = React.createClass( {
	propTypes: {
		list: React.PropTypes.shape( {
			owner: React.PropTypes.string.isRequired,
			slug: React.PropTypes.string.isRequired
		} )
	},

	smartSetState: smartSetState,

	getInitialState() {
		return this.getStateFromStores();
	},

	getStateFromStores() {
		// Fetch items, but only if we have the list information
		const list = this.props.list;
		let items = null;
		let isLastPage = false;
		let currentPage = 0;
		if ( list && list.ID ) {
			items = this.getItems( list.ID );
			isLastPage = ReaderListsItemsStore.isLastPage( list.ID );
			currentPage = ReaderListsItemsStore.getCurrentPage( list.ID );
		}

		const newState = {
			items,
			isLastPage,
			currentPage,
			isFetchingItems: ReaderListsItemsStore.isFetching(),
			lastListError: ReaderListsStore.getLastError(),
		};

		return newState;
	},

	getItems( listId ) {
		return ReaderListsItemsStore.getItemsForList( listId );
	},

	update() {
		this.smartSetState( this.getStateFromStores() );
	},

	componentDidMount() {
		ReaderListsStore.on( 'change', this.update );
		ReaderListsItemsStore.on( 'change', this.update );
	},

	componentWillUnmount() {
		ReaderListsStore.off( 'change', this.update );
		ReaderListsItemsStore.off( 'change', this.update );
	},

	loadMore( options ) {
		fetchMoreItems( this.props.list.owner, this.props.list.slug, this.state.currentPage + 1 );
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.state.currentPage );
		}
	},

	renderPlaceholders() {
		const number = 2;

		return times( number, ( i ) => {
			return (
				<Placeholder key={ 'list-placeholder-' + i } />
			);
		} );
	},

	getItemRef( item ) {
		return 'list-item-' + item.get( 'ID' );
	},

	trackItemClick() {
		stats.recordAction( 'click_item_on_list_management' );
		stats.recordGaEvent( 'Clicked Item on List Management' );
	},

	renderItem( item ) {
		const itemKey = this.getItemRef( item );

		return (
			<ListManagementSitesListItem key={ itemKey } listItem={ item } />
		);
	},

	renderItemList() {
		if ( ! this.state.items ) {
			return null;
		}

		if ( this.props.list && this.state.items.size === 0 && this.state.isLastPage ) {
			return ( <EmptyContent
						title={ this.translate( 'This list does not have any sites yet.' ) }
						illustration={ '/calypso/images/drake/drake-404.svg' }
						illustrationWidth={ 500 } /> );
		}

		return (
			<InfiniteList
					items={ this.state.items.toArray() }
					fetchingNextPage={ this.state.isFetchingItems }
					lastPage={ this.state.isLastPage }
					guessedItemHeight={ 300 }
					fetchNextPage={ this.loadMore }
					getItemRef={ this.getItemRef }
					renderItem={ this.renderItem }
					renderLoadingPlaceholders={ this.renderPlaceholders } />
		);
	},

	render() {
		if ( ! this.props.list && this.state.lastListError ) {
			return ( <ListManagementError /> );
		}

		return (
			<div>
				{ this.renderItemList() }
			</div>
		);
	}
} );

export default ListManagementSites;
