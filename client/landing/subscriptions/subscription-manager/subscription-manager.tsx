import { Reader } from '@automattic/data-stores';
import SubscriptionManager from '@automattic/subscription-manager';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import Settings from '../tab-views/settings';
import TabsSwitcher from '../tabs-switcher/tabs-switcher';

const SitesView = () => <span>Sites View</span>;
const CommentsView = () => <span>Comments View</span>;

const SubscriptionManagementPage = () => {
	const translate = useTranslate();
	const { data: counts } = Reader.useSubscriptionManagerSubscriptionsCountQuery();
	const tabs = useMemo(
		() => [
			{
				label: translate( 'Sites' ),
				path: 'sites',
				view: SitesView,
				count: counts?.blogs || undefined,
			},
			{
				label: translate( 'Comments' ),
				path: 'comments',
				view: CommentsView,
				count: counts?.comments || undefined,
			},
			{
				label: translate( 'Settings' ),
				path: 'settings',
				view: Settings,
			},
		],
		[ counts?.blogs, counts?.comments, translate ]
	);

	return (
		<SubscriptionManager>
			<TabsSwitcher baseRoute="subscriptions" tabs={ tabs } />
		</SubscriptionManager>
	);
};

export default SubscriptionManagementPage;
