import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { useSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import ListItem from './list-item';

// This is different than the item adder as this simply shows followed subscriptions to recommended
// adding, and only appears if the list has been empty. This is also intended to show beneath the
// list items (where the item adder shows items above), so items it adds are not hidden beneath the
// long list of subs.
export default function SubscriptionItemAdder( { list, listItems, owner } ) {
	const translate = useTranslate();
	const [ renderAllSubscriptions, setRenderAllSubscriptions ] = useState( false );

	const { subscriptions } = useSiteSubscriptions( { fetchAllPages: renderAllSubscriptions } );

	// Continue showing the subscriptions list if we have showed it once in this session.
	useEffect( () => {
		if ( listItems?.length === 0 ) {
			setRenderAllSubscriptions( true );
		}
	}, [ listItems ] );

	if ( ! renderAllSubscriptions || ! subscriptions?.length ) {
		return null;
	}

	return (
		<>
			<h2 className="list-manage__subscriptions-header">{ translate( 'Your subscriptions' ) }</h2>
			{ subscriptions.map( ( item ) => (
				<ListItem
					hideIfInList
					isFollowed
					hideFollowButton
					item={ item }
					key={ item.feed_ID || item.site_ID || item.tag_ID || item.feed_URL }
					list={ list }
					owner={ owner }
				/>
			) ) }
		</>
	);
}
