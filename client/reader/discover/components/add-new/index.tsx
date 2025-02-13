import { User, UserSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { AddSitesForm } from 'calypso/landing/subscriptions/components/add-sites-form';
import { SiteSubscriptionsList } from 'calypso/landing/subscriptions/components/site-subscriptions-list';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';

import './style.scss';

const USER_STORE = User.register();

const DiscoverAddNew = () => {
	const translate = useTranslate();
	const isLoggedIn = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
		[]
	);

	return (
		<div className="discover-add-new">
			<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
				<div className="discover-add-new__form">
					<h2 className="discover-add-new__form-title">
						{ translate( 'Add new sites, newsletters, and RSS feeds to your reading list.' ) }
					</h2>
					<AddSitesForm onAddFinished={ () => {} } />
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
