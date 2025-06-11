import { useTranslate } from 'i18n-calypso';
import { Item } from 'calypso/components/breadcrumb';
import Gravatar from 'calypso/components/gravatar';
import NavigationHeader from 'calypso/components/navigation-header';
import { decodeEntities } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { PaidSubscription } from '../../types';

import './style.scss';

type PaidSubscriptionProps = {
	paidSubscription: PaidSubscription;
};
const earnPath = ! isJetpackCloud() ? '/earn' : '/monetize';

const PaidSubscriptionHeader = ( { paidSubscription }: PaidSubscriptionProps ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const breadcrumbs: Item[] = [
		{
			label: translate( 'Monetize' ),
			href: `${ earnPath }/${ siteSlug }`,
		},
		{
			label: translate( 'Active Paid Subscriptions' ),
			href: `${ earnPath }/paid-subscriptions/${ siteSlug }`,
		},
		{
			label: translate( 'Details' ),
			href: '#',
		},
	];

	return (
		<>
			<NavigationHeader navigationItems={ breadcrumbs } />
			<div className="paid-subscription__header">
				<Gravatar
					user={ paidSubscription.user }
					size={ 40 }
					className="paid-subscription__header-image"
				/>
				<div className="paid-subscription__header-details">
					<span className="paid-subscription__header-name">
						{ decodeEntities( paidSubscription.user.name ) }
					</span>
					<span className="paid-subscription__header-email">
						{ paidSubscription.user.user_email }
					</span>
				</div>
			</div>
		</>
	);
};

export default PaidSubscriptionHeader;
