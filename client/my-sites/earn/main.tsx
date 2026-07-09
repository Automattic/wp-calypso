import { capitalize } from '@automattic/js-utils';
import { Page } from '@wordpress/admin-ui';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackFooter from 'calypso/components/jetpack/jetpack-footer';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main from 'calypso/components/main';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import AdsSettings from 'calypso/my-sites/earn/ads/form-settings';
import WordAdsPayments from 'calypso/my-sites/earn/ads/payments';
import WordAdsEarnings from 'calypso/my-sites/stats/wordads/earnings';
import WordAdsHighlightsSection from 'calypso/my-sites/stats/wordads/highlights-section';
import { useSelector } from 'calypso/state';
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

	const isJetpackPlatform = isJetpackCloud();

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

	const getAdSelectedText = () => {
		const selected = getAdTabs().find( ( tab ) => tab.path === path );
		if ( selected ) {
			return selected.title;
		}

		return '';
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
		return (
			<div className="earn-navigation">
				<SectionNav variation={ ! isJetpackPlatform ? 'minimal' : '' } enforceTabsView>
					<NavTabs hasHorizontalScroll>
						{ getEarnTabs().map( ( tabItem ) => {
							return (
								<NavItem
									key={ tabItem.id }
									path={ tabItem.path }
									selected={ isEarnTabSelected( tabItem ) }
								>
									{ tabItem.title }
								</NavItem>
							);
						} ) }
					</NavTabs>
				</SectionNav>
			</div>
		);
	};

	const getAdsHeader = () => {
		const currentPath = getCurrentPath();

		return (
			<div className="earn__ads-header">
				<h2 className="formatted-header__title wp-brand-font">{ translate( 'Ads Dashboard' ) }</h2>

				<SectionNav selectedText={ getAdSelectedText() }>
					<NavTabs>
						{ getAdTabs().map( ( filterItem ) => {
							return (
								<NavItem
									key={ filterItem.id }
									path={ filterItem.path }
									selected={ filterItem.path === currentPath }
								>
									{ filterItem.title }
								</NavItem>
							);
						} ) }
					</NavTabs>
				</SectionNav>
			</div>
		);
	};

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
		<Main fullWidthLayout className="earn">
			<PageViewTracker
				path={ section ? `${ earnPath }/${ section }/:site` : `${ earnPath }/:site` }
				title={ `${ adsProgramName } ${ capitalize( section ) }` }
			/>
			<DocumentHead
				title={ layoutTitles[ section as keyof typeof layoutTitles ] ?? translate( 'Monetize' ) }
			/>
			{ isJetpackPlatform && <SidebarNavigation /> }
			<Page
				hasPadding
				showSidebarToggle={ false }
				title={
					showPageHeader && ! isJetpackPlatform ? (
						<JetpackTitle title={ translate( 'Monetize' ) } />
					) : undefined
				}
				subTitle={
					showPageHeader && ! isJetpackPlatform
						? translate(
								'Explore tools to earn money with your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
								{
									components: {
										learnMoreLink: <InlineSupportLink supportContext="earn" showIcon={ false } />,
									},
								}
						  )
						: undefined
				}
			>
				{ content }
			</Page>
			{ ! isJetpackPlatform && <JetpackFooter /> }
		</Main>
	);
};

export default EarningsMain;
