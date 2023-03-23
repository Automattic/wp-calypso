import { Reader } from '@automattic/data-stores';
import SubscriptionManager from '@automattic/subscription-manager';
import { useTranslate } from 'i18n-calypso';
import Settings from '../tab-views/settings';

const SitesView = () => <span>Sites View</span>;
const CommentsView = () => <span>Comments View</span>;

const SubscriptionManagementPage = () => {
	const translate = useTranslate();
	const { data: counts } = Reader.useSubscriptionManagerSubscriptionsCountQuery();

	return (
		<SubscriptionManager>
			<SubscriptionManager.TabsSwitcher
				baseRoute="subscriptions"
				defaultTab="sites"
				tabs={ [
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
				] }
			/>
		</SubscriptionManager>
	);
};

export default SubscriptionManagementPage;
