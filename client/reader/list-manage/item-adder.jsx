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
import SearchInput from 'calypso/components/search';
import { resemblesUrl } from 'calypso/lib/url';

import { getReaderFeedsForQuery } from 'calypso/state/reader/feed-searches/selectors';
import { SORT_BY_RELEVANCE } from 'calypso/state/reader/feed-searches/actions';
import FeedUrlAdder from './feed-url-adder';
import ListItem from './list-item';

const readerFeedsSelectorParams = { excludeFollowed: true, sort: SORT_BY_RELEVANCE };

export default function ItemAdder( props ) {
	const translate = useTranslate();

	const [ query, updateQuery ] = React.useState( '' );
	const queryIsUrl = resemblesUrl( query );
	const searchResults = useSelector( ( state ) =>
		getReaderFeedsForQuery( state, { query, ...readerFeedsSelectorParams } )
	);

	return (
		<div className="list-manage__item-adder">
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

			{ ! searchResults && query && (
				<QueryReaderFeedsSearch query={ query } excludeFollowed={ true } />
			) }

			{ ! queryIsUrl &&
				searchResults?.map( ( item ) => (
					<ListItem
						key={ item.feed_ID || item.site_ID || item.tag_ID }
						item={ item }
						list={ props.list }
						owner={ props.owner }
					/>
				) ) }
		</div>
	);
}
