import { SubscriptionManager } from '@automattic/data-stores';
import { Spinner, __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { Notice, NoticeType } from '../notice';
import SiteSubscriptionRow from './site-subscription-row';
import './styles/site-subscriptions-list.scss';

type SiteSubscriptionsListProps = {
	emptyComponent?: React.ComponentType;
	notFoundComponent?: React.ComponentType;
};

const SiteSubscriptionsList: React.FC< SiteSubscriptionsListProps > = ( {
	emptyComponent: EmptyComponent,
	notFoundComponent: NotFoundComponent,
} ) => {
	const translate = useTranslate();
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();
	const { filterOption, searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	const { data, isLoading, error } = SubscriptionManager.useSiteSubscriptionsQuery();
	const { subscriptions, totalCount } = data;

	if ( error ) {
		return (
			<Notice type={ NoticeType.Error }>
				{ translate(
					'We had a small hiccup loading your subscriptions. Please try refreshing the page.'
				) }
			</Notice>
		);
	}

	if ( isLoading ) {
		return (
			<div className="loading-container">
				<Spinner />
			</div>
		);
	}

	if ( ! isLoading && ! totalCount ) {
		if ( EmptyComponent ) {
			return <EmptyComponent />;
		}
		return (
			<Notice type={ NoticeType.Warning }>
				{ translate( 'You are not subscribed to any sites.' ) }
			</Notice>
		);
	}

	if ( totalCount > 0 && subscriptions.length === 0 ) {
		if ( NotFoundComponent ) {
			return <NotFoundComponent />;
		}
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
			<HStack className="row header" role="row" as="li" alignment="center">
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
				<span className="unsubscribe-action-cell" role="columnheader">
					{ translate( 'Action' ) }
				</span>
				<span className="actions-cell" role="columnheader" />
			</HStack>
			{ subscriptions.map( ( siteSubscription ) => (
				<SiteSubscriptionRow
					key={ `sites.siteRow.${ siteSubscription.ID }` }
					{ ...siteSubscription }
				/>
			) ) }
		</ul>
	);
};

export default SiteSubscriptionsList;
