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
import AddSubscriptionForm from './components/add-subscription-form';
import {
	ADD_SUBSCRIPTION_CONFIGS,
	SubscriptionType,
} from './components/add-subscription-form/consts';

interface Tab {
	slug: SubscriptionType;
	title: TranslateResult;
	path: string;
}

interface ReaderNewSubscriptionPageProps {
	selectedTab: SubscriptionType;
}

export default function ReaderNewSubscriptionPage(
	props: ReaderNewSubscriptionPageProps
): JSX.Element {
	const { selectedTab } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const ADD_SUBSCRIPTION_TABS: Tab[] = Object.values( ADD_SUBSCRIPTION_CONFIGS ).map(
		( config ): Tab => ( {
			slug: config.slug,
			title: config.title,
			path: config.url,
		} )
	);

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
					{ ADD_SUBSCRIPTION_TABS.map(
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

			<AddSubscriptionForm key={ `add-subs-form-${ selectedTab }` } type={ selectedTab } />
		</ReaderMain>
	);
}
