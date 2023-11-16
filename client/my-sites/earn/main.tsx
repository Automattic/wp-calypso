import { useTranslate } from 'i18n-calypso';
import { capitalize, find } from 'lodash';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import AdsSettings from 'calypso/my-sites/earn/ads/form-settings';
import WordAdsPayments from 'calypso/my-sites/earn/ads/payments';
import WordAdsEarnings from 'calypso/my-sites/stats/wordads/earnings';
import WordAdsHighlightsSection from 'calypso/my-sites/stats/wordads/highlights-section';
import { useSelector } from 'calypso/state';
import { canAccessWordAds, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import AdsWrapper from './ads/wrapper';
import CustomerSection from './customers';
import Home from './home';
import MembershipsProductsSection from './memberships/products';
import MembershipsSection from './memberships/section';
import ReferAFriendSection from './refer-a-friend';
import { Query } from './types';

type EarningsMainProps = {
	section?: string;
	query: Query;
	path: string;
};

const EarningsMain = ( { section, query, path }: EarningsMainProps ) => {
	const translate = useTranslate();
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const canAccessAds = useSelector( ( state ) => canAccessWordAds( state, site?.ID ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, site?.ID ) );
	const adsProgramName = isJetpack ? 'Ads' : 'WordAds';

	const layoutTitles = {
		'ads-earnings': translate( '%(wordads)s Earnings', { args: { wordads: adsProgramName } } ),
		'ads-settings': translate( '%(wordads)s Settings', { args: { wordads: adsProgramName } } ),
		'ads-payments': translate( '%(wordads)s Payments', { args: { wordads: adsProgramName } } ),
		payments: translate( 'Payment Settings' ),
		supporters: translate( 'Supporters' ),
		'payments-plans': translate( 'Recurring Payments plans' ),
		'refer-a-friend': translate( 'Refer-a-Friend Program' ),
	};

	const getEarnTabs = () => {
		const pathSuffix = site?.slug ? '/' + site?.slug : '';
		return [
			{
				title: translate( 'Monetization Options' ),
				path: '/earn' + pathSuffix,
				id: 'earn',
			},
			{
				title: translate( 'Supporters' ),
				path: '/earn/supporters' + pathSuffix,
				id: 'supporters',
			},
			{
				title: translate( 'Payment Settings' ),
				path: '/earn/payments' + pathSuffix,
				id: 'payments',
			},
		];
	};

	const getAdTabs = () => {
		const pathSuffix = site?.slug ? '/' + site?.slug : '';
		const tabs = [];

		if ( canAccessAds ) {
			tabs.push( {
				title: translate( 'Earnings' ),
				path: '/earn/ads-earnings' + pathSuffix,
				id: 'ads-earnings',
			} );
			tabs.push( {
				title: translate( 'Payments' ),
				path: '/earn/ads-payments' + pathSuffix,
				id: 'ads-payments',
			} );
			tabs.push( {
				title: translate( 'Settings' ),
				path: '/earn/ads-settings' + pathSuffix,
				id: 'ads-settings',
			} );
		}

		return tabs;
	};

	const getEarnSelectedText = () => {
		const selected = find( getEarnTabs(), { path: path } );
		if ( selected ) {
			return selected.title;
		}

		return '';
	};

	const getAdSelectedText = () => {
		const selected = find( getAdTabs(), { path: path } );
		if ( selected ) {
			return selected.title;
		}

		return '';
	};

	const isAdSection = ( currentSection: string | undefined ) =>
		currentSection && currentSection.startsWith( 'ads' );

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
			case 'payments-plans':
				return <MembershipsProductsSection />;

			case 'supporters':
				return <CustomerSection />;

			case 'refer-a-friend':
				return <ReferAFriendSection />;

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

	const getEarnSectionNav = () => {
		const currentPath = getCurrentPath();

		return (
			<div id="earn-navigation">
				<SectionNav selectedText={ getEarnSelectedText() }>
					<NavTabs>
						{ getEarnTabs().map( ( tabItem ) => {
							return (
								<NavItem
									key={ tabItem.id }
									path={ tabItem.path }
									selected={ tabItem.path === currentPath }
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

	return (
		<Main wideLayout={ true } className="earn">
			<PageViewTracker
				path={ section ? `/earn/${ section }/:site` : `/earn/:site` }
				title={ `${ adsProgramName } ${ capitalize( section ) }` }
			/>
			<DocumentHead
				title={ layoutTitles[ section as keyof typeof layoutTitles ] ?? translate( 'Monetize' ) }
			/>
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'Monetize' ) }
				subtitle={ translate(
					'Explore tools to earn money with your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="earn" showIcon={ false } />,
						},
					}
				) }
			/>
			{ getEarnSectionNav() }
			{ isAdSection( section ) && getAdsHeader() }
			{ getComponent( section ) }
		</Main>
	);
};

export default EarningsMain;
