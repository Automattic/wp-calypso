import { SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { Notice, NoticeType } from '../notice';
import SiteRow from './site-row';
import { useSiteSubscriptionsManager } from './site-subscriptions-manager-context';

const SiteSubscriptionsList = () => {
	const translate = useTranslate();
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();
	const { filterOption, siteSubscriptionsQueryResult, searchTerm } = useSiteSubscriptionsManager();
	const { data } = siteSubscriptionsQueryResult;

	if ( ! data ) {
		throw new Error(
			'SiteSubscriptionsList depends on the response from the site subscriptions query '
		);
	}

	const { subscriptions, totalCount } = data;

	if ( totalCount > 0 && subscriptions.length === 0 ) {
		return (
			<Notice type={ NoticeType.Warning }>
				{ translate( 'Sorry, no sites match {{italic}}%s.{{/italic}}', {
					components: { italic: <i /> },
					args: searchTerm || filterOption,
				} ) }
			</Notice>
		);
	}

	return (
		<ul className="site-subscriptions-list" role="table">
			<li className="row header" role="row">
				<span className="title-cell" role="columnheader">
					{ translate( 'Subscribed site' ) }
				</span>
				<span className="date-cell" role="columnheader">
					{ translate( 'Since' ) }
				</span>
				{ isLoggedIn && (
					<span className="new-posts-cell" role="columnheader">
						{ translate( 'New posts' ) }
					</span>
				) }
				{ isLoggedIn && (
					<span className="new-comments-cell" role="columnheader">
						{ translate( 'New comments' ) }
					</span>
				) }
				<span className="email-frequency-cell" role="columnheader">
					{ translate( 'Email frequency' ) }
				</span>
				<span className="actions-cell" role="columnheader" />
			</li>
			{ subscriptions.map( ( siteSubscription ) => (
				<SiteRow key={ `sites.siteRow.${ siteSubscription.ID }` } { ...siteSubscription } />
			) ) }
		</ul>
	);
};

export default SiteSubscriptionsList;
