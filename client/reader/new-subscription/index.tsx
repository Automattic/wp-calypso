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
import AddNew from './components/add-new';
import AddReddit from './components/add-reddit';
import AddTumblr from './components/add-tumblr';
import AddYouTube from './components/add-youtube';

interface Tab {
	slug: string;
	title: TranslateResult;
	path: string;
}

enum Tabs {
	ADD_NEW = 'add-new',
	REDDIT = 'reddit',
	YOUTUBE = 'youtube',
	TUMBLR = 'tumblr',
}

export const NEW_SUBSCRIPTION_TABS: typeof Tabs = Tabs;

interface ReaderNewSubscriptionPageProps {
	selectedTab: Tabs;
}

export default function ReaderNewSubscriptionPage(
	props: ReaderNewSubscriptionPageProps
): JSX.Element {
	const { selectedTab } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();

	const pathPrefix: string = 'reader/new';
	const NEW_SUBSCRIPTION_TABS: Tab[] = [
		{
			slug: Tabs.ADD_NEW,
			title: translate( 'Add new' ),
			path: `/${ pathPrefix }`,
		},
		{
			slug: Tabs.REDDIT,
			title: translate( 'Reddit' ),
			path: `/${ pathPrefix }/reddit`,
		},
		{
			slug: Tabs.YOUTUBE,
			title: translate( 'YouTube' ),
			path: `/${ pathPrefix }/youtube`,
		},
		{
			slug: Tabs.TUMBLR,
			title: translate( 'Tumblr' ),
			path: `/${ pathPrefix }/tumblr`,
		},
	];
	const TAB_COMPONENTS: Record< Tabs, JSX.Element > = {
		[ Tabs.ADD_NEW ]: <AddNew />,
		[ Tabs.REDDIT ]: <AddReddit />,
		[ Tabs.YOUTUBE ]: <AddYouTube />,
		[ Tabs.TUMBLR ]: <AddTumblr />,
	};

	function recordTabClick( tabSlug: string ): void {
		recordAction( 'click_new_subscription_tab' );
		recordGaEvent( 'Clicked New Subscription Tab' );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_new_subscription_tab_clicked', { tabSlug } )
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

			{ TAB_COMPONENTS[ selectedTab ] }
		</ReaderMain>
	);
}
