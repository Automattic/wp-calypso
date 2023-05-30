import { SubscriptionManager, Reader } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import SiteRow from './site-row';

type SiteListProps = {
	sites?: Reader.SiteSubscription[];
};

const defaultSites: Reader.SiteSubscription[] = [];

export default function SiteSubscriptionsList( { sites = defaultSites }: SiteListProps ) {
	const translate = useTranslate();
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();

	return (
		<ul className="site-subscriptions-list" role="table">
			<li className="row header" role="row">
				<span className="title-box" role="columnheader">
					{ translate( 'Subscribed site' ) }
				</span>
				<span className="date" role="columnheader">
					{ translate( 'Since' ) }
				</span>
				{ isLoggedIn && (
					<span className="new-posts" role="columnheader">
						{ translate( 'New posts' ) }
					</span>
				) }
				{ isLoggedIn && (
					<span className="new-comments" role="columnheader">
						{ translate( 'New comments' ) }
					</span>
				) }
				<span className="email-frequency" role="columnheader">
					{ translate( 'Email frequency' ) }
				</span>
				<span className="actions" role="columnheader" />
			</li>
			{ sites &&
				sites.map( ( site ) => <SiteRow key={ `sites.siterow.${ site.ID }` } { ...site } /> ) }
		</ul>
	);
}
