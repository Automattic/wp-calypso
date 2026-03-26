import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import { Page } from '@wordpress/admin-ui';
import { Tabs } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { capitalize } from 'lodash';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import AdsSettings from 'calypso/my-sites/earn/ads/form-settings';
import WordAdsPayments from 'calypso/my-sites/earn/ads/payments';
import WordAdsEarnings from 'calypso/my-sites/stats/wordads/earnings';
import WordAdsHighlightsSection from 'calypso/my-sites/stats/wordads/highlights-section';
import { useSelector } from 'calypso/state';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { canAccessWordAds, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import AdsWrapper from './ads/wrapper';
import Home from './home';
import MembershipsSection from './memberships/section';
import PaidSubscriptions from './paid-subscriptions';
import { Query } from './types';

type EarningsMainProps = {
	section?: string;
	query: Query;
	path: string;
};

type Tab = {
	title: string;
	path: string;
	id: string;
};

const earnPath = ! isJetpackCloud() ? '/earn' : '/monetize';

const EarningsMain = ( { section, query, path }: EarningsMainProps ) => {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const canAccessAds = useSelector( ( state ) => canAccessWordAds( state, site?.ID ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, site?.ID ) );
	const adsProgramName = isJetpack ? 'Ads' : 'WordAds';
	const paidSubscriptionId = query?.paid_susbcription;
	const isAtomicSite = useSelector( ( state ) => isSiteAutomatedTransfer( state, site?.ID ) );
	const isJetpackNotAtomic = isJetpack && ! isAtomicSite;

	const layoutTitles = {
		'ads-earnings': translate( '%(wordads)s Earnings', { args: { wordads: adsProgramName } } ),
		'ads-settings': translate( '%(wordads)s Settings', { args: { wordads: adsProgramName } } ),
		'ads-payments': translate( '%(wordads)s Payments', { args: { wordads: adsProgramName } } ),
		payments: translate( 'Payment Settings' ),
		'paid-subscriptions': translate( 'Paid Subscribers' ),
		'refer-a-friend': translate( 'Refer-a-Friend Program' ),
	};

	const getEarnTabs = () => {
		const pathSuffix = site?.slug ? '/' + site?.slug : '';
		return [
			{
				title: translate( 'Monetization Options' ),
				path: earnPath + pathSuffix,
				id: 'earn',
			},
			{
				title: translate( 'Paid Subscribers' ),
				path: earnPath + '/paid-subscriptions' + pathSuffix,
				id: 'paid-subscriptions',
			},
			{
				title: translate( 'Payment Settings' ),
				path: earnPath + '/payments' + pathSuffix,
				id: 'payments',
			},
			{
				title: translate( 'Ads' ),
				path: earnPath + '/ads-earnings' + pathSuffix,
				id: 'ads-earnings',
			},
		];
	};

	const getAdTabs = () => {
		const pathSuffix = site?.slug ? '/' + site?.slug : '';
		const tabs = [];

		if ( canAccessAds ) {
			tabs.push( {
				title: translate( 'Earnings' ),
				path: earnPath + '/ads-earnings' + pathSuffix,
				id: 'ads-earnings',
			} );
			tabs.push( {
				title: translate( 'Payments' ),
				path: earnPath + '/ads-payments' + pathSuffix,
				id: 'ads-payments',
			} );
			tabs.push( {
				title: translate( 'Settings' ),
				path: earnPath + '/ads-settings' + pathSuffix,
				id: 'ads-settings',
			} );
		}

		return tabs;
	};

	const isAdSection = ( currentSection: string | undefined ) =>
		currentSection && currentSection.startsWith( 'ads' );

	const isSinglePaidSubscriptionSection = ( currentSection: string | undefined ) =>
		currentSection && currentSection.startsWith( 'paid-subscriptions' ) && paidSubscriptionId;

	const getComponent = ( currentSection: string | undefined ) => {
		switch ( currentSection ) {
			case 'ads-earnings':
				return (
					<AdsWrapper section={ section }>
						<WordAdsHighlightsSection siteId={ site?.ID } />
						<WordAdsEarnings site={ site } />
					</AdsWrapper>
				);
			case 'ads-payments':
				return (
					<AdsWrapper section={ section }>
						<WordAdsPayments />
					</AdsWrapper>
				);
			case 'ads-settings':
				return (
					<AdsWrapper section={ section }>
						<AdsSettings />
					</AdsWrapper>
				);
			case 'payments':
				return <MembershipsSection query={ query } />;

			case 'paid-subscriptions':
				return <PaidSubscriptions query={ query } />;

			default:
				return <Home />;
		}
	};

	/**
	 * Remove any query parameters from the path before using it to
	 * identify which screen the user is seeing.
	 */
	const getCurrentPath = (): string => {
		let currentPath = path;
		const queryStartPosition = currentPath.indexOf( '?' );
		if ( queryStartPosition > -1 ) {
			currentPath = currentPath.substring( 0, queryStartPosition );
		}
		return currentPath;
	};

	const isEarnTabSelected = ( tabItem: Tab ) => {
		const currentPath = getCurrentPath();

		if ( 'ads-earnings' === tabItem.id ) {
			return isAdSection( section );
		}

		return tabItem.path === currentPath;
	};

	const getEarnSectionNav = () => {
		const tabs = getEarnTabs();
		const selectedTab = tabs.find( isEarnTabSelected );

		return (
			<div className="earn-navigation">
				<Tabs.Root
					value={ selectedTab?.id ?? tabs[ 0 ]?.id }
					onValueChange={ ( tabId: string ) => {
						const tab = tabs.find( ( item ) => item.id === tabId );
						if ( tab ) {
							page.show( tab.path );
						}
					} }
				>
					<Tabs.List variant={ ! isJetpackCloud() ? 'minimal' : 'default' }>
						{ tabs.map( ( tabItem ) => (
							<Tabs.Tab key={ tabItem.id } value={ tabItem.id }>
								{ tabItem.title }
							</Tabs.Tab>
						) ) }
					</Tabs.List>
				</Tabs.Root>
			</div>
		);
	};

	const getAdsHeader = () => {
		const tabs = getAdTabs();
		const currentPath = getCurrentPath();
		const selectedTab = tabs.find( ( tabItem ) => tabItem.path === currentPath );

		return (
			<div className="earn__ads-header">
				<h2 className="formatted-header__title wp-brand-font">{ translate( 'Ads Dashboard' ) }</h2>

				<Tabs.Root
					value={ selectedTab?.id ?? tabs[ 0 ]?.id }
					onValueChange={ ( tabId: string ) => {
						const tab = tabs.find( ( item ) => item.id === tabId );
						if ( tab ) {
							page.show( tab.path );
						}
					} }
				>
					<Tabs.List variant="minimal">
						{ tabs.map( ( tabItem ) => (
							<Tabs.Tab key={ tabItem.id } value={ tabItem.id }>
								{ tabItem.title }
							</Tabs.Tab>
						) ) }
					</Tabs.List>
				</Tabs.Root>
			</div>
		);
	};

	const atomicLearnMoreLink = localizeUrl( 'https://wordpress.com/support/monetize-your-site/' );
	const jetpackLearnMoreLink = localizeUrl( 'https://jetpack.com/support/monetize-your-site/' );
	const showPageHeader = ! isSinglePaidSubscriptionSection( section );

	const content = (
		<>
			{ showPageHeader && getEarnSectionNav() }
			<div className="earn-content">
				{ isAdSection( section ) && getAdsHeader() }
				{ getComponent( section ) }
			</div>
		</>
	);

	return (
		<Main fullWidthLayout={ showPageHeader } wideLayout={ ! showPageHeader } className="earn">
			<PageViewTracker
				path={ section ? `${ earnPath }/${ section }/:site` : `${ earnPath }/:site` }
				title={ `${ adsProgramName } ${ capitalize( section ) }` }
			/>
			<DocumentHead
				title={ layoutTitles[ section as keyof typeof layoutTitles ] ?? translate( 'Monetize' ) }
			/>
			{ showPageHeader ? (
				<Page
					showSidebarToggle={ false }
					title={ <JetpackTitle title={ translate( 'Monetize' ) } /> }
					subTitle={ translate(
						'Explore tools to earn money with your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: isJetpackCloud() ? (
									<a
										href={ isJetpackNotAtomic ? jetpackLearnMoreLink : atomicLearnMoreLink }
										target="_blank"
										rel="noopener noreferrer"
									/>
								) : (
									<InlineSupportLink supportContext="earn" showIcon={ false } />
								),
							},
						}
					) }
				>
					{ content }
				</Page>
			) : (
				content
			) }
		</Main>
	);
};

export default EarningsMain;
