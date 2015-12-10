// External dependencies
import React from 'react';
import times from 'lodash/utility/times';
import debugModule from 'debug';

// Internal dependencies
import Main from 'components/main';
import Navigation from 'reader/list-management/navigation';
import InfiniteList from 'components/infinite-list';
import ListItem from 'reader/list-item';
import Icon from 'reader/list-item/icon';
import Title from 'reader/list-item/title';
import Description from 'reader/list-item/description';
import Actions from 'reader/list-item/actions';
import Gridicon from 'components/gridicon';
import ListStore from 'lib/reader-lists/lists';
import ReaderListsActions from 'lib/reader-lists/actions';
import ReaderListsTagsStore from 'lib/reader-lists-tags/store';
import { fetchMoreTags } from 'lib/reader-lists-tags/actions';
import smartSetState from 'lib/react-smart-set-state';

const debug = debugModule( 'calypso:reader:list-management' ); // eslint-disable-line

let listFetchAttempted = false;

const ListManagementTags = React.createClass( {
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
		// Grab the list ID from the list store
		const list = ListStore.get( this.props.list.owner, this.props.list.slug );
		if ( ! list && listFetchAttempted ) {
			ReaderListsActions.fetchSubscriptions();
			listFetchAttempted = true;
		}

		// Fetch tags, but only if we have the list information
		let tags = null;
		let isLastPage = false;
		let currentPage = 0;
		if ( list && list.ID ) {
			tags = this.getTags( list.ID );
			isLastPage = ReaderListsTagsStore.isLastPage( list.ID );
			currentPage = ReaderListsTagsStore.getCurrentPage( list.ID );
		}

		return {
			list,
			tags,
			isLastPage,
			currentPage,
			isFetchingTags: ReaderListsTagsStore.isFetching(),
			lastError: ReaderListsTagsStore.getLastError(),
		};
	},

	getTags( listId ) {
		return ReaderListsTagsStore.getTagsForList( listId );
	},

	update() {
		this.smartSetState( this.getStateFromStores() );
	},

	componentDidMount() {
		ListStore.on( 'change', this.update );
		ReaderListsTagsStore.on( 'change', this.update );
	},

	componentWillUnmount() {
		ListStore.off( 'change', this.update );
		ReaderListsTagsStore.off( 'change', this.update );
	},

	loadMore( options ) {
		fetchMoreTags( this.props.list.owner, this.props.list.slug, this.state.currentPage + 1 );
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.state.currentPage );
		}
	},

	renderPlaceholders() {
		const placeholders = [],
			number = 2;

		times( number, ( i ) => {
			placeholders.push(
				<ListItem className="is-placeholder" key={'list-placeholder-' + i}>
					<Icon><Gridicon icon="tag" size={ 48 } /></Icon>
					<Title>Loading</Title>
					<Description></Description>
				</ListItem>
			);
		} );

		return placeholders;
	},

	getItemRef( item ) {
		return 'list-tag-' + item.ID;
	},

	trackTagClick() {
		stats.recordAction( 'click_tag_on_list_management' );
		stats.recordGaEvent( 'Clicked Tag on List Management' );
	},

	renderItem( tag ) {
		const itemKey = this.getItemRef( tag );

		return (
			<ListItem key={ itemKey } ref={ itemKey }>
				<Icon><Gridicon icon="tag" size={ 48 } /></Icon>
				<Title>
					<a href={ '/tag/' + tag.slug } onclick={ this.trackTagClick }>{ tag.slug }</a>
				</Title>
				<Description></Description>
				<Actions>
				</Actions>
			</ListItem>
		);
	},

	renderTagList() {
		if ( ! this.state.tags ) {
			return null;
		}

		return (
			<InfiniteList
					items={ this.state.tags }
					fetchingNextPage={ this.state.isFetchingTags }
					lastPage={ this.state.isLastPage }
					guessedItemHeight={ 300 }
					fetchNextPage={ this.loadMore }
					getItemRef={ this.getItemRef }
					renderItem={ this.renderItem }
					renderLoadingPlaceholders={ this.renderPlaceholders }
				/>
		);
	},

	render() {
		let message = null;
		if ( ! this.state.list ) {
			message = ( <p> {this.translate( 'Loading list information…' ) } </p> );
		}

		if ( this.state.list && this.state.tags.length === 0 && this.state.isLastPage ) {
			message = ( <p> {this.translate( 'This list does not have any tags yet.' ) } </p> );
		}

		return (
			<Main className="list-management-tags">
				<Navigation selected="tags" list={ this.props.list } />
				{ message }
				{ this.renderTagList() }
			</Main>
			);
	}
} );

export default ListManagementTags;
