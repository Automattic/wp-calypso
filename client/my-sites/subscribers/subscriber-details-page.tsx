import { useTranslate } from 'i18n-calypso';
import { Item } from 'calypso/components/breadcrumb';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { SubscriberDetails } from './components/subscriber-details';
import { SubscriberPopover } from './components/subscriber-popover';

type SubscriberDetailsPageProps = {
	subscriberId?: number;
	userId?: number;
};

const SubscriberDetailsPage = ( { subscriberId, userId }: SubscriberDetailsPageProps ) => {
	const translate = useTranslate();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const navigationItems: Item[] = [
		{
			label: translate( 'Subscribers' ),
			href: `/subscribers/${ selectedSiteSlug }`,
		},
		{
			label: translate( 'Details' ),
			href: `/subscribers/${ selectedSiteSlug }/${ subscriberId }`,
		},
	];

	return (
		<Main wideLayout>
			<FixedNavigationHeader navigationItems={ navigationItems }>
				<SubscriberPopover onUnsubscribe={ () => undefined } />
			</FixedNavigationHeader>
			<SubscriberDetails subscriber={ mockSubscriber } />
		</Main>
	);
};

export default SubscriberDetailsPage;
