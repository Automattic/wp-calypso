import { useTranslate } from 'i18n-calypso';
import { AddSitesForm } from 'calypso/landing/subscriptions/components/add-sites-form';
import { SiteSubscriptionsList } from 'calypso/landing/subscriptions/components/site-subscriptions-list';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

import './style.scss';

const DiscoverAddNew = () => {
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );

	return (
		<div className="discover-add-new">
			<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
				<div className="discover-add-new__form">
					<h2 className="discover-add-new__form-title">
						{ translate( 'Add new sites, newsletters, and RSS feeds to your reading list.' ) }
					</h2>
					<AddSitesForm />
				</div>
				{ isLoggedIn && (
					<div className="discover-add-new__subscriptions">
						<h2 className="discover-add-new__subscriptions-title">
							{ translate( 'Your subscriptions' ) }
						</h2>
						<SiteSubscriptionsList />
					</div>
				) }
			</SubscriptionManagerContextProvider>
		</div>
	);
};

export default DiscoverAddNew;
