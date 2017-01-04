import React from 'react';
import {
	always,
	range,
	propEq
} from 'ramda';

import FilterBarFactory, { Filter } from './filter-bar';
import NoteListView from './note-list-view';
import ListViewPlaceholder from './note-list-placeholder';
import Gridicon from 'components/gridicon';
import GroupedList, { GroupHeader } from './grouped-list';
import {
	isPlaceholder,
	fromToday,
	fromYesterday,
	before2Days,
	before7Days
} from './list-group-filters';

const { FilterBar, getFilter } = FilterBarFactory();

const compareTimestamps = ( a, b ) => b.timestamp - a.timestamp;

const transformProps = props => {
	const {
		notes,
		selectedFilter
	} = props;

	return {
		...props,
		notes: notes.filter( getFilter( selectedFilter ) ).sort( compareTimestamps )
	};
};

const ListViewLayout = React.createClass( {
	render() {
		const {
			notes,
			selectNote,
			selectedFilter,
			selectFilter
		} = transformProps( this.props );

		return (
			<div>
				<FilterBar { ...{ selectedFilter, selectFilter } }>
					<Filter name="All" filter={ always( true ) } />
					<Filter name="Unread" filter={ propEq( 'read', 0 ) } />
					<Filter name="Comments" filter={ propEq( 'type', 'comment' ) } />
					<Filter name="Follows" filter={ propEq( 'type', 'follow' ) } />
					<Filter name="Likes" filter={ propEq( 'type', 'like' ) } />
				</FilterBar>
				<GroupedList>
					<GroupHeader filter={ isPlaceholder }>
						<Gridicon icon="cloud-download" /> Loading notifications…
					</GroupHeader>
					<GroupHeader filter={ fromToday }>
						<Gridicon icon="time" /> Today
					</GroupHeader>
					<GroupHeader filter={ fromYesterday }>
						<Gridicon icon="time" /> Yesterday
					</GroupHeader>
					<GroupHeader filter={ before2Days }>
						<Gridicon icon="time" /> Older than 2 days
					</GroupHeader>
					<GroupHeader filter={ before7Days }>
						<Gridicon icon="time" /> Older than a week
					</GroupHeader>

					{ ! notes.length &&
						range( 1, 8 ).map( key =>
							<ListViewPlaceholder { ...{ key } } /> ) }

					{ notes.map( ( note, key ) => (
						<NoteListView { ...{ key, note, selectNote } } />
					) ) }
				</GroupedList>
			</div>
		);
	}
} );

export default ListViewLayout;
