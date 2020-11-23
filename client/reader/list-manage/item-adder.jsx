/**
 * External Dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal Dependencies
 */
import { Card } from '@automattic/components';
import QueryReaderFeedsSearch from 'calypso/components/data/query-reader-feeds-search';
import SyncReaderFollows from 'calypso/components/data/sync-reader-follows';
import SearchInput from 'calypso/components/search';
import { resemblesUrl } from 'calypso/lib/url';
import { filterFollowsByQuery } from 'calypso/reader/follow-helpers';
import { getReaderFeedsForQuery } from 'calypso/state/reader/feed-searches/selectors';
import { getReaderFollows } from 'calypso/state/reader/follows/selectors';
import { SORT_BY_RELEVANCE } from 'calypso/state/reader/feed-searches/actions';
import FeedUrlAdder from './feed-url-adder';
import ListItem from './list-item';

export default function ItemAdder( props ) {
	const translate = useTranslate();

	const [ query, updateQuery ] = React.useState( '' );
	const queryIsUrl = resemblesUrl( query );
	const followResults = useSelector( ( state ) =>
		filterFollowsByQuery( query, getReaderFollows( state ) ).slice( 0, 7 )
	);
	const feedResults = useSelector( ( state ) =>
		getReaderFeedsForQuery( state, { query, excludeFollowed: false, sort: SORT_BY_RELEVANCE } )
	);

	return (
		<div className="list-manage__item-adder" id="reader-list-item-adder">
			<Card className="list-manage__query-input">
				<SearchInput
					additionalClasses="following-manage__search-new"
					delaySearch={ true }
					delayTimeout={ 500 }
					disableAutocorrect={ true }
					initialValue={ query }
					maxLength={ 500 }
					onSearch={ updateQuery }
					placeholder={ translate( 'Search or enter URL to follow…' ) }
					value={ query }
				/>
				{ queryIsUrl && <FeedUrlAdder list={ props.list } query={ query } /> }
			</Card>

			{ ! feedResults && query && (
				<QueryReaderFeedsSearch excludeFollowed={ false } query={ query } />
			) }

			<SyncReaderFollows />

			{ query &&
				! queryIsUrl &&
				followResults?.map( ( item ) => (
					<ListItem
						hideIfInList
						isFollowed
						item={ item }
						key={ item.feed_ID || item.site_ID || item.tag_ID || item.feed_URL }
						list={ props.list }
						owner={ props.owner }
					/>
				) ) }
			{ ! queryIsUrl &&
				feedResults?.map( ( item ) => (
					<ListItem
						hideIfInList
						item={ item }
						key={ item.feed_ID || item.feed_URL }
						list={ props.list }
						owner={ props.owner }
					/>
				) ) }
		</div>
	);
}
