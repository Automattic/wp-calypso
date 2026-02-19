import { TranslateResult, useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderMain from '../components/reader-main';
import ReaderAddSubscription from './components/add-subscription';
import {
	NEW_SUBSCRIPTION_CONFIG,
	NewSubscriptionType,
	ReaderNewSubscriptionConfig,
} from './new-subscription.const';

interface Tab {
	slug: NewSubscriptionType;
	title: TranslateResult;
	path: string;
}

interface ReaderNewSubscriptionPageProps {
	selectedTab: NewSubscriptionType;
}

export default function ReaderNewSubscriptionPage(
	props: ReaderNewSubscriptionPageProps
): JSX.Element {
	const { selectedTab } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const NEW_SUBSCRIPTION_TABS: Tab[] = Object.values( NEW_SUBSCRIPTION_CONFIG ).map(
		( config: ReaderNewSubscriptionConfig ): Tab => ( {
			slug: config.slug,
			title: config.title,
			path: config.url,
		} )
	);
	const selectedTabConfig = NEW_SUBSCRIPTION_CONFIG[ selectedTab ];

	function recordTabClick( selectedTab: string ): void {
		recordAction( 'click_new_subscription_tab' );
		recordGaEvent( 'Clicked New Subscription Tab' );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_new_subscription_tab_clicked', {
				tab_slug: selectedTab,
			} )
		);
	}

	return (
		<ReaderMain>
			<DocumentHead title={ translate( 'New Subscription' ) } />

			<NavigationHeader
				title={ translate( 'New Subscription' ) }
				subtitle={ translate( 'Subscribe to new blogs, newsletters, and RSS feeds.' ) }
			/>

			<SectionNav className="new-subscription-navigation" variation="minimal" enforceTabsView>
				<NavTabs>
					{ NEW_SUBSCRIPTION_TABS.map(
						( tab: Tab ): JSX.Element => (
							<NavItem
								key={ tab.slug }
								selected={ selectedTab === tab.slug }
								path={ tab.path }
								onClick={ () => recordTabClick( tab.slug ) }
							>
								{ tab.title }
							</NavItem>
						)
					) }
				</NavTabs>
			</SectionNav>

			<ReaderAddSubscription config={ selectedTabConfig } />
		</ReaderMain>
	);
}
