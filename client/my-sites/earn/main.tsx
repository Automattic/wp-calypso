import { useTranslate } from 'i18n-calypso';
import { capitalize, find } from 'lodash';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import AdsSettings from 'calypso/my-sites/earn/ads/form-settings';
import WordAdsPayments from 'calypso/my-sites/earn/ads/payments';
import WordAdsEarnings from 'calypso/my-sites/stats/wordads/earnings';
import WordAdsHighlightsSection from 'calypso/my-sites/stats/wordads/highlights-section';
import { useSelector } from 'calypso/state';
import { canAccessWordAds } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import AdsWrapper from './ads/wrapper';
import Home from './home';
import MembershipsSection from './memberships';
import MembershipsProductsSection from './memberships/products';
import ReferAFriendSection from './refer-a-friend';

type EarningsMainProps = {
	section: string;
	adsProgramName: string;
	query: string;
	path: string;
};

const EarningsMain = ( { section, adsProgramName, query, path }: EarningsMainProps ) => {
	const translate = useTranslate();
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const canAccessAds = useSelector( ( state ) => canAccessWordAds( state, site?.ID ) );

	const layoutTitles = {
		earnings: translate( '%(wordads)s Earnings', { args: { wordads: adsProgramName } } ),
		settings: translate( '%(wordads)s Settings', { args: { wordads: adsProgramName } } ),
		payments: translate( 'Recurring Payments' ),
		'payments-plans': translate( 'Recurring Payments plans' ),
		'refer-a-friend': translate( 'Refer-a-Friend Program' ),
	};

	const getFilters = () => {
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

	const getSelectedText = () => {
		const selected = find( getFilters(), { path: path } );
		if ( selected ) {
			return selected.title;
		}

		return '';
	};

	const getComponent = ( currentSection: string ) => {
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

			case 'refer-a-friend':
				return <ReferAFriendSection />;

			default:
				return <Home />;
		}
	};

	/**
	 * Remove any query parameters from the path before using it to
	 * identify which screen the user is seeing.
	 *
	 * @returns {string} Path to current screen.
	 */
	const getCurrentPath = () => {
		let currentPath = path;
		const queryStartPosition = currentPath.indexOf( '?' );
		if ( queryStartPosition > -1 ) {
			currentPath = currentPath.substring( 0, queryStartPosition );
		}
		return currentPath;
	};

	/**
	 * Check the current path and returns an appropriate title.
	 *
	 * @returns {string} Header text for current screen.
	 */
	const getHeaderText = () => {
		switch ( section ) {
			case 'payments':
				return translate( 'Payments' );
			case 'ads-earnings':
			case 'ads-payments':
			case 'ads-settings':
				return translate( 'Ads' );

			case 'refer-a-friend':
				return translate( 'Refer-a-Friend Program' );

			default:
				return '';
		}
	};

	const getHeaderCake = () => {
		const headerText = getHeaderText();
		return (
			headerText && (
				<HeaderCake backHref={ `/earn/${ site?.slug ?? '' }` }>{ headerText }</HeaderCake>
			)
		);
	};

	const getSectionNav = ( currentSection: string ) => {
		const currentPath = getCurrentPath();

		return (
			! currentSection.startsWith( 'payments' ) &&
			! currentSection.startsWith( 'refer-a-friend' ) && (
				<SectionNav selectedText={ getSelectedText() }>
					<NavTabs>
						{ getFilters().map( ( filterItem ) => {
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
			)
		);
	};

	return (
		<Main wideLayout={ true } className="earn">
			<PageViewTracker
				path={ section ? `/earn/${ section }/:site` : `/earn/:site` }
				title={ `${ adsProgramName } ${ capitalize( section ) }` }
			/>
			<DocumentHead title={ layoutTitles[ section as keyof typeof layoutTitles ] } />
			<FormattedHeader
				brandFont
				className="earn__page-header"
				headerText={ translate( 'Earn' ) }
				subHeaderText={ translate(
					'Explore tools to earn money with your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="earn" showIcon={ false } />,
						},
					}
				) }
				align="left"
			/>
			{ getHeaderCake() }
			{ section && getSectionNav( section ) }
			{ getComponent( section ) }
		</Main>
	);
};

export default EarningsMain;
