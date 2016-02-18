// External dependencies
import React from 'react';
import times from 'lodash/times';
import debugModule from 'debug';

// Internal dependencies
import InfiniteList from 'components/infinite-list';
import ListItem from 'reader/list-item';
import Icon from 'reader/list-item/icon';
import Title from 'reader/list-item/title';
import Description from 'reader/list-item/description';
import Actions from 'reader/list-item/actions';
import Gridicon from 'components/gridicon';
import ReaderListsStore from 'lib/reader-lists/lists';
import ReaderListsTagsStore from 'lib/reader-lists-tags/store';
import { fetchMoreTags } from 'lib/reader-lists-tags/actions';
import smartSetState from 'lib/react-smart-set-state';
import ListManagementError from '../error';
import EmptyContent from 'components/empty-content';

const debug = debugModule( 'calypso:reader:list-management' ); // eslint-disable-line
const stats = require( 'reader/stats' );

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
		// Fetch tags, but only if we have the list information
		const list = this.props.list;
		let tags = null;
		let isLastPage = false;
		let currentPage = 0;
		if ( list && list.ID ) {
			tags = this.getTags( list.ID );
			isLastPage = ReaderListsTagsStore.isLastPage( list.ID );
			currentPage = ReaderListsTagsStore.getCurrentPage( list.ID );
		}

		return {
			tags,
			isLastPage,
			currentPage,
			isFetchingTags: ReaderListsTagsStore.isFetching(),
			lastListError: ReaderListsStore.getLastError(),
		};
	},

	getTags( listId ) {
		return ReaderListsTagsStore.getTagsForList( listId );
	},

	update() {
		this.smartSetState( this.getStateFromStores() );
	},

	componentDidMount() {
		ReaderListsStore.on( 'change', this.update );
		ReaderListsTagsStore.on( 'change', this.update );
	},

	componentWillUnmount() {
		ReaderListsStore.off( 'change', this.update );
		ReaderListsTagsStore.off( 'change', this.update );
	},

	loadMore( options ) {
		fetchMoreTags( this.props.list.owner, this.props.list.slug, this.state.currentPage + 1 );
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.state.currentPage );
		}
	},

	renderPlaceholders() {
		const number = 2;

		return times( number, ( i ) => {
			return (
				<ListItem className="is-placeholder" key={ 'list-placeholder-' + i }>
					<Icon><Gridicon icon="tag" size={ 48 } /></Icon>
					<Title>Loading</Title>
					<Description></Description>
				</ListItem>
			);
		} );
	},

	getItemRef( item ) {
		return 'list-tag-' + item.get( 'ID' );
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
					<a href={ '/tag/' + tag.get( 'slug' ) } onclick={ this.trackTagClick }>{ tag.get( 'slug' ) }</a>
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

		if ( this.props.list && this.state.tags.size === 0 && this.state.isLastPage ) {
			return ( <EmptyContent
						title={ this.translate( 'This list does not have any tags yet.' ) }
						illustration={ '/calypso/images/drake/drake-404.svg' }
						illustrationWidth={ 500 } /> );
		}

		return (
			<InfiniteList
					items={ this.state.tags.toArray() }
					fetchingNextPage={ this.state.isFetchingTags }
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
				{ this.renderTagList() }
			</div>
		);
	}
} );

export default ListManagementTags;
