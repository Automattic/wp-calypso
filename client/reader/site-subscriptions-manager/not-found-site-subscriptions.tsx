import { SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';

const NotFoundSiteSubscriptions = () => {
	const translate = useTranslate();
	const { searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();

	return (
		<div className="not-found-site-subscriptions">
			{
				/* translators: the string is the exact text that the user entered into the search input in site subscriptions manager in Reader */
				translate(
					'No results found for “%s” in your subscribed sites. Below are some recommended sites for you.',
					{
						args: searchTerm,
						comment:
							"When users type something into the search field of their site subscriptions manager in Reader, they'll see this message if their search doesn't find any of the websites they're currently subscribed to.",
					}
				)
			}
		</div>
	);
};

export default NotFoundSiteSubscriptions;
