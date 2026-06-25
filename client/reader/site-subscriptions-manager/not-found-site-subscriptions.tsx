import { SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import type { JSX } from 'react';

const NotFoundSiteSubscriptions = (): JSX.Element => {
	const translate = useTranslate();
	const { searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();

	return (
		<div className="not-found-site-subscriptions">
			{ searchTerm && searchTerm.length
				? translate( "You're not subscribed to any matching sites.", {
						comment:
							"When users type something into the search field of their site subscriptions manager in Reader, they'll see this message if their search doesn't find any of the websites they're currently subscribed to.",
				  } )
				: translate( 'No results found.', {
						comment:
							"When users type something into the search field of their site subscriptions manager in Reader, they'll see this message if their search doesn't find any of the websites they're currently subscribed to.",
				  } ) }
		</div>
	);
};

export default NotFoundSiteSubscriptions;
