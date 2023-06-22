import { useTranslate } from 'i18n-calypso';
import { Item } from 'calypso/components/breadcrumb';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { SubscriberDetails } from './components/subscriber-details';
import { SubscriberPopover } from './components/subscriber-popover';

type SubscriberDetailsPageProps = {
	subscriberId: number;
};

const SubscriberDetailsPage = ( { subscriberId }: SubscriberDetailsPageProps ) => {
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

	const mockSubscriber = {
		avatar: `https://secure.gravatar.com/avatar/${ subscriberId }`,
		subscription_id: subscriberId,
		email_address: 'mock.subscriber@email.com',
		display_name: 'Mock Subscriber',
		date_subscribed: '2021-01-01T00:00:00.000Z',
		open_rate: 0,
		user_id: 0,
	};

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
