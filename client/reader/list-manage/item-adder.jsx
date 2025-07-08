import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import QueryReaderFeedsSearch from 'calypso/components/data/query-reader-feeds-search';
import SyncReaderFollows from 'calypso/components/data/sync-reader-follows';
import SearchInput from 'calypso/components/search';
import { resemblesUrl } from 'calypso/lib/url';
import { filterFollowsByQuery } from 'calypso/reader/follow-helpers';
import { SORT_BY_RELEVANCE } from 'calypso/state/reader/feed-searches/actions';
import { getReaderFeedsForQuery } from 'calypso/state/reader/feed-searches/selectors';
import { getReaderFollows } from 'calypso/state/reader/follows/selectors';
import FeedUrlAdder from './feed-url-adder';
import ListItem from './list-item';

export default function ItemAdder( props ) {
	const translate = useTranslate();
	const [ renderAllFollows, setRenderAllFollows ] = useState( false );

	const [ query, updateQuery ] = useState( '' );
	const queryIsUrl = resemblesUrl( query );
	const followResults = useSelector( ( state ) =>
		filterFollowsByQuery( query, getReaderFollows( state ) ).slice( 0, 7 )
	);
	const allFollows = useSelector( ( state ) => getReaderFollows( state ) );
	const feedResults = useSelector( ( state ) =>
		getReaderFeedsForQuery( state, { query, excludeFollowed: false, sort: SORT_BY_RELEVANCE } )
	);

	// Continue showing the all follows list when there is no query, if we have been in the empty
	// state and exposed it once in this session.
	useEffect( () => {
		if ( props.listItems?.length === 0 ) {
			setRenderAllFollows( true );
		}
	}, [ props.listItems ] );
	const showAllFollows = renderAllFollows && ! query;

	return (
		<div className="list-manage__item-adder" id="reader-list-item-adder">
			<Card className="list-manage__query-input">
				<SearchInput
					additionalClasses="following-manage__search-new"
					delaySearch
					delayTimeout={ 500 }
					disableAutocorrect
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
			{ showAllFollows && (
				<>
					<h2 className="list-manage-item-adder__all-subscriptions">
						{ translate( 'Your subscriptions' ) }
					</h2>
					{ allFollows.map( ( item ) => (
						<ListItem
							hideIfInList
							isFollowed
							hideFollowButton
							item={ item }
							key={ item.feed_ID || item.site_ID || item.tag_ID || item.feed_URL }
							list={ props.list }
							owner={ props.owner }
						/>
					) ) }
				</>
			) }
		</div>
	);
}
