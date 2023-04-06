import { SubscriptionManager } from '@automattic/data-stores';
import { UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { useSubheaderText } from '../hooks';
import { Comments, Settings, Sites } from '../tab-views';
import { TabsSwitcher } from '../tabs-switcher';
import './styles.scss';

const SubscriptionManagementPage = () => {
	const translate = useTranslate();
	const { data: counts } = SubscriptionManager.useSubscriptionsCountQuery();
	const tabs = useMemo(
		() => [
			{
				label: translate( 'Sites' ),
				path: 'sites',
				view: Sites,
				count: counts?.blogs || undefined,
			},
			{
				label: translate( 'Comments' ),
				path: 'comments',
				view: Comments,
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
		<>
			<UniversalNavbarHeader
				className="subscription-manager-header"
				variant="minimal"
				isLoggedIn={ false }
			/>
			<Main className="subscription-manager__container">
				<DocumentHead title="Subscriptions" />
				<FormattedHeader
					brandFont
					headerText={ translate( 'Subscription management' ) }
					subHeaderText={ useSubheaderText() }
					align="left"
				/>
				<TabsSwitcher baseRoute="subscriptions" tabs={ tabs } />
			</Main>
		</>
	);
};

export default SubscriptionManagementPage;
