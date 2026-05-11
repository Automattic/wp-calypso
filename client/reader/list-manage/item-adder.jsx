import { ReadFeedSearchSort } from '@automattic/api-core';
import { readFeedSearchQuery } from '@automattic/api-queries';
import { Card, Spinner } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import SyncReaderFollows from 'calypso/components/data/sync-reader-follows';
import SearchInput from 'calypso/components/search';
import ListItem from './list-item';

export default function ItemAdder( props ) {
	const translate = useTranslate();
	const [ query, updateQuery ] = useState( '' );
	const { data, isFetching } = useQuery(
		readFeedSearchQuery( {
			query,
			excludeFollowed: false,
			sort: ReadFeedSearchSort.Relevance,
		} )
	);
	const feedResults = data?.feeds;

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

			{ isFetching && query && <Spinner /> }

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
