/**
 * External Dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal Dependencies
 */
import FollowButton from 'calypso/blocks/follow-button/button';
import { addSchemeIfMissing, withoutHttp } from 'calypso/lib/url';
import { addReaderListFeedByUrl, deleteReaderListFeed } from 'calypso/state/reader/lists/actions';
import { getMatchingItem } from 'calypso/state/reader/lists/selectors';

export default function FeedUrlAdder( { list, query } ) {
	const translate = useTranslate();
	const queryWithoutProtocol = withoutHttp( query );
	const dispatch = useDispatch();

	const matchingFeedFromQuery = useSelector( ( state ) =>
		getMatchingItem( state, { listId: list.ID, feedUrl: query } )
	);

	return (
		<div className="list-manage__url-follow">
			<FollowButton
				followLabel={ translate( 'Add %s', {
					args: queryWithoutProtocol,
					comment:
						'%s is the name of the site being added to a Reader List. For example: "Discover"',
				} ) }
				followingLabel={ translate( 'Added %s', {
					args: queryWithoutProtocol,
					comment:
						'%s is the name of the site being added to a Reader List. For example: "Discover"',
				} ) }
				following={ !! matchingFeedFromQuery }
				onFollowToggle={ ( selected ) =>
					dispatch(
						selected
							? addReaderListFeedByUrl(
									list.ID,
									list.owner,
									list.slug,
									addSchemeIfMissing( query, 'https' )
							  )
							: deleteReaderListFeed(
									list.ID,
									list.owner,
									list.slug,
									matchingFeedFromQuery.feed_ID
							  )
					)
				}
			/>
		</div>
	);
}
