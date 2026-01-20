import { Card, Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import QueryReaderFeedsSearch from 'calypso/components/data/query-reader-feeds-search';
import SyncReaderFollows from 'calypso/components/data/sync-reader-follows';
import SearchInput from 'calypso/components/search';
import { SORT_BY_RELEVANCE } from 'calypso/state/reader/feed-searches/actions';
import { getReaderFeedsForQuery } from 'calypso/state/reader/feed-searches/selectors';
import ListItem from './list-item';

export default function ItemAdder( props ) {
	const translate = useTranslate();
	const [ query, updateQuery ] = useState( '' );
	const feedResults = useSelector( ( state ) =>
		getReaderFeedsForQuery( state, { query, excludeFollowed: false, sort: SORT_BY_RELEVANCE } )
	);

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
			</Card>

			{ ! feedResults && query && (
				<>
					<QueryReaderFeedsSearch excludeFollowed={ false } query={ query } />
					<Spinner />
				</>
			) }

			<SyncReaderFollows />

			{ query &&
				feedResults?.map( ( item ) => (
					<ListItem
						item={ item }
						key={ item.feed_ID || item.feed_URL }
						list={ props.list }
						owner={ props.owner }
					/>
				) ) }
		</div>
	);
}
