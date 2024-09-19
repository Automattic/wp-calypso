import { useTranslate } from 'i18n-calypso';
import { Item } from 'calypso/components/breadcrumb';
import Gravatar from 'calypso/components/gravatar';
import NavigationHeader from 'calypso/components/navigation-header';
import { decodeEntities } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { Subscriber } from '../../types';

import './style.scss';

type CustomerHeaderProps = {
	customer: Subscriber;
};
const earnPath = ! isJetpackCloud() ? '/earn' : '/monetize';

const CustomerHeader = ( { customer }: CustomerHeaderProps ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const breadcrumbs: Item[] = [
		{
			label: translate( 'Monetize' ),
			href: `${ earnPath }/${ siteSlug }`,
		},
		{
			label: translate( 'Supporters' ),
			href: `${ earnPath }/supporters/${ siteSlug }`,
		},
		{
			label: translate( 'Details' ),
			href: '#',
		},
	];

	return (
		<>
			<NavigationHeader navigationItems={ breadcrumbs } />
			<div className="customer__header">
				<Gravatar user={ customer.user } size={ 40 } className="customer__header-image" />
				<div className="customer__header-details">
					<span className="customer__header-name">{ decodeEntities( customer.user.name ) }</span>
					<span className="customer__header-email">{ customer.user.user_email }</span>
				</div>
			</div>
		</>
	);
};

export default CustomerHeader;
