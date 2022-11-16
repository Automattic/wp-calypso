import config from '@automattic/calypso-config';
import { FEATURE_INSTALL_THEMES } from '@automattic/calypso-products';
import cookie from 'cookie';
import { localize } from 'i18n-calypso';
import { compact, pickBy } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import UpworkBanner from 'calypso/blocks/upwork-banner';
import { isUpworkBannerDismissed } from 'calypso/blocks/upwork-banner/selector';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryThemeFilters from 'calypso/components/data/query-theme-filters';
import OlarkChat from 'calypso/components/olark-chat';
import SearchThemes from 'calypso/components/search-themes';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { buildRelativeSearchUrl } from 'calypso/lib/build-url';
import AutoLoadingHomepageModal from 'calypso/my-sites/themes/auto-loading-homepage-modal';
import ThanksModal from 'calypso/my-sites/themes/thanks-modal';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	getActiveTheme,
	getCanonicalTheme,
	getThemeFilterTerms,
	getThemeFilterToTermTable,
	getThemeShowcaseDescription,
	getThemeShowcaseTitle,
	prependThemeFilterKeys,
	getOutdatedThemes,
	isUpsellCardDisplayed as isUpsellCardDisplayedSelector,
} from 'calypso/state/themes/selectors';
import { getThemesBookmark } from 'calypso/state/themes/themes-ui/selectors';
import { addTracking, trackClick, localizeThemesPath } from './helpers';
import RecommendedThemes from './recommended-themes';
import ThemePreview from './theme-preview';
import ThemesSearchCard from './themes-magic-search-card';
import ThemesSelection from './themes-selection';
import TrendingThemes from './trending-themes';

import './theme-showcase.scss';

const optionShape = PropTypes.shape( {
	label: PropTypes.string,
	header: PropTypes.string,
	getUrl: PropTypes.func,
	action: PropTypes.func,
} );

class ThemeShowcase extends Component {
	constructor( props ) {
		super( props );
		this.scrollRef = createRef();
		this.bookmarkRef = createRef();
		this.tabFilters = {
			RECOMMENDED: {
				key: 'recommended',
				text: props.translate( 'Recommended' ),
				order: 1,
			},
			TRENDING: { key: 'trending', text: props.translate( 'Trending' ), order: 2 },
			MYTHEMES: {
				key: 'my-themes',
				text: props.translate( 'My Themes' ),
				order: 3,
			},
			ALL: { key: 'all', text: props.translate( 'All Themes' ), order: 4 },
		};
		this.state = {
			tabFilter:
				this.props.loggedOutComponent || this.props.search || this.props.filter || this.props.tier
					? this.tabFilters.ALL
					: this.tabFilters.RECOMMENDED,
		};
	}

	static propTypes = {
		currentThemeId: PropTypes.string,
		emptyContent: PropTypes.element,
		tier: PropTypes.oneOf( [ '', 'free', 'premium' ] ),
		search: PropTypes.string,
		pathName: PropTypes.string,
		// Connected props
		options: PropTypes.objectOf( optionShape ),
		defaultOption: optionShape,
		secondaryOption: optionShape,
		getScreenshotOption: PropTypes.func,
		siteCanInstallThemes: PropTypes.bool,
		siteSlug: PropTypes.string,
		upsellBanner: PropTypes.any,
		trackMoreThemesClick: PropTypes.func,
		loggedOutComponent: PropTypes.bool,
		isAtomicSite: PropTypes.bool,
		isJetpackSite: PropTypes.bool,
		outdatedThemes: PropTypes.array,
	};

	static defaultProps = {
		tier: '',
		search: '',
		emptyContent: null,
		upsellBanner: false,
		showUploadButton: true,
	};

	componentDidMount() {
		const { themesBookmark } = this.props;
		// Scroll to bookmark if applicable.
		if ( themesBookmark ) {
			// Timeout to move this to the end of the event queue or it won't work here.
			setTimeout( () => {
				const lastTheme = this.bookmarkRef.current;
				if ( lastTheme ) {
					lastTheme.scrollIntoView( {
						behavior: 'auto',
						block: 'center',
						inline: 'center',
					} );
				}
			} );
		}
	}

	componentDidUpdate( prevProps ) {
		if (
			prevProps.search !== this.props.search ||
			prevProps.filter !== this.props.filter ||
			prevProps.tier !== this.props.tier
		) {
			this.scrollToSearchInput();
		}
	}

	scrollToSearchInput = () => {
		if ( ! this.props.loggedOutComponent && this.scrollRef && this.scrollRef.current ) {
			// If you are a larger screen where the theme info is displayed horizontally.
			if ( window.innerWidth > 600 ) {
				return;
			}
			const headerHeight = document
				.getElementsByClassName( 'masterbar' )[ 0 ]
				?.getBoundingClientRect().height;
			const screenOptionTab = document
				.getElementsByClassName( 'screen-options-tab__button' )[ 0 ]
				?.getBoundingClientRect().height;

			const yOffset = -( headerHeight + screenOptionTab ); // Total height of admin bar and screen options on mobile.
			const elementBoundary = this.scrollRef.current.getBoundingClientRect();

			const y = elementBoundary.top + window.pageYOffset + yOffset;
			window.scrollTo( { top: y } );
		}
	};

	doSearch = ( searchBoxContent ) => {
		const filterRegex = /([\w-]*):([\w-]*)/g;
		const { filterToTermTable } = this.props;

		const filters = searchBoxContent.match( filterRegex ) || [];
		const validFilters = filters.map( ( filter ) => filterToTermTable[ filter ] );

		const url = this.constructUrl( {
			filter: compact( validFilters ).join( '+' ),
			// Strip filters and excess whitespace
			searchString: searchBoxContent.replace( filterRegex, '' ).replace( /\s+/g, ' ' ).trim(),
		} );
		this.setState( { tabFilter: this.tabFilters.ALL } );
		page( url );
		this.scrollToSearchInput();
	};

	/**
	 * Returns a full showcase url from current props.
	 *
	 * @param {object} sections fields from this object will override current props.
	 * @param {string} sections.vertical override vertical prop
	 * @param {string} sections.tier override tier prop
	 * @param {string} sections.filter override filter prop
	 * @param {string} sections.siteSlug override siteSlug prop
	 * @param {string} sections.searchString override searchString prop
	 * @returns {string} Theme showcase url
	 */
	constructUrl = ( sections ) => {
		const { vertical, tier, filter, siteSlug, searchString, locale, isLoggedIn } = {
			...this.props,
			...sections,
		};

		const siteIdSection = siteSlug ? `/${ siteSlug }` : '';
		const verticalSection = vertical ? `/${ vertical }` : '';
		const tierSection = tier && tier !== 'all' ? `/${ tier }` : '';

		let filterSection = filter ? `/filter/${ filter }` : '';
		filterSection = filterSection.replace( /\s/g, '+' );
		const url = localizeThemesPath(
			`/themes${ verticalSection }${ tierSection }${ filterSection }${ siteIdSection }`,
			locale,
			! isLoggedIn
		);
		return buildRelativeSearchUrl( url, searchString );
	};

	onTierSelect = ( { value: tier } ) => {
		// In this state: tabFilter = [ ##Recommended## | All(1) ]   tier = [ All(2) | Free | Premium ]
		// Clicking "Free" or "Premium" forces tabFilter from "Recommended" to "All"
		if ( tier !== '' && tier !== 'all' && this.state.tabFilter.key !== this.tabFilters.ALL.key ) {
			this.setState( { tabFilter: this.tabFilters.ALL } );
		}
		trackClick( 'search bar filter', tier );
		const url = this.constructUrl( { tier } );
		page( url );
		this.scrollToSearchInput();
	};

	onFilterClick = ( tabFilter ) => {
		const scrollPos = window.pageYOffset;
		trackClick( 'section nav filter', tabFilter );
		this.setState( { tabFilter } );

		let callback = () => null;
		// In this state: tabFilter = [ Recommended | ##All(1)## ]  tier = [ All(2) | Free | ##Premium## ]
		// Clicking "Recommended" forces tier to be "all", since Recommend themes cannot filter on tier.
		if ( tabFilter.key !== this.tabFilters.ALL.key && 'all' !== this.props.tier ) {
			callback = () => {
				this.onTierSelect( { value: 'all' } );
				window.scrollTo( 0, scrollPos );
			};
		}
		this.setState( { tabFilter }, callback );
	};

	renderBanner = () => {
		const { loggedOutComponent, isExpertBannerDissmissed, upsellBanner, isUpsellCardDisplayed } =
			this.props;

		// Don't show the banner if there is already an upsell card displayed
		if ( isUpsellCardDisplayed ) {
			return null;
		}

		const tabKey = this.state.tabFilter.key;

		if (
			tabKey !== this.tabFilters.MYTHEMES.key &&
			! isExpertBannerDissmissed &&
			! loggedOutComponent
		) {
			// these are from the time we rely on the redirect.
			// See p2-pau2Xa-4nq#comment-12480
			let location = 'theme-banner';
			let utmCampaign = 'built-by-wordpress-com-redirect';

			// See p2-pau2Xa-4nq#comment-12458 for the context regarding the utm campaign value.
			switch ( tabKey ) {
				case this.tabFilters.RECOMMENDED.key:
					location = 'recommended-theme-banner';
					utmCampaign = 'theme-rec-tre';
					break;
				case this.tabFilters.TRENDING.key:
					location = 'trending-theme-banner';
					utmCampaign = 'theme-rec-tre';
					break;
				case this.tabFilters.ALL.key:
					location = 'all-theme-banner';
					utmCampaign = 'theme-all';
			}

			return <UpworkBanner location={ location } utmCampaign={ utmCampaign } />;
		}

		return upsellBanner;
	};

	allThemes = ( { themeProps } ) => {
		const { isJetpackSite, children } = this.props;
		if ( isJetpackSite ) {
			return children;
		}
		return (
			<div className="theme-showcase__all-themes">
				<ThemesSelection { ...themeProps } />
			</div>
		);
	};

	shouldShowTab = ( key ) => {
		switch ( key ) {
			case this.tabFilters.RECOMMENDED.key:
			case this.tabFilters.TRENDING.key:
			case this.tabFilters.ALL.key:
				return true;
			case this.tabFilters.MYTHEMES.key:
				return (
					( this.props.isJetpackSite && ! this.props.isAtomicSite ) ||
					( this.props.isAtomicSite && this.props.siteCanInstallThemes )
				);
		}
	};

	notificationCount = ( key ) => {
		switch ( key ) {
			case this.tabFilters.MYTHEMES.key:
				return this.props.outdatedThemes.length || null;
			case this.tabFilters.RECOMMENDED.key:
			case this.tabFilters.TRENDING.key:
			case this.tabFilters.ALL.key:
				return null;
		}
	};

	render() {
		const {
			siteId,
			options,
			getScreenshotOption,
			search,
			filter,
			isLoggedIn,
			pathName,
			title,
			filterString,
			isMultisite,
			locale,
		} = this.props;
		const tier = this.props.tier || '';

		const canonicalUrl = 'https://wordpress.com' + pathName;

		const metas = [
			{ name: 'description', property: 'og:description', content: this.props.description },
			{ property: 'og:title', content: title },
			{ property: 'og:url', content: canonicalUrl },
			{ property: 'og:type', content: 'website' },
			{ property: 'og:site_name', content: 'WordPress.com' },
		];

		const themeProps = {
			forceWpOrgSearch: true,
			filter: filter,
			vertical: this.props.vertical,
			siteId: this.props.siteId,
			upsellUrl: this.props.upsellUrl,
			search: search,
			tier: this.props.tier,
			defaultOption: this.props.defaultOption,
			secondaryOption: this.props.secondaryOption,
			placeholderCount: this.props.placeholderCount,
			bookmarkRef: this.bookmarkRef,
			getScreenshotUrl: ( theme ) => {
				if ( ! getScreenshotOption( theme ).getUrl ) {
					return null;
				}

				return localizeThemesPath(
					getScreenshotOption( theme ).getUrl( theme ),
					locale,
					! isLoggedIn
				);
			},
			onScreenshotClick: ( themeId ) => {
				if ( ! getScreenshotOption( themeId ).action ) {
					return;
				}
				getScreenshotOption( themeId ).action( themeId );
			},
			getActionLabel: ( theme ) => getScreenshotOption( theme ).label,
			trackScrollPage: this.props.trackScrollPage,
			emptyContent: this.props.emptyContent,
			scrollToSearchInput: this.scrollToSearchInput,
			getOptions: ( theme ) =>
				pickBy(
					addTracking( options ),
					( option ) => ! ( option.hideForTheme && option.hideForTheme( theme, siteId ) )
				),
		};

		const olarkIdentity = config( 'olark_chat_identity' );
		const olarkSystemsGroupId = '239c0f99c53692d81539f76e86910d52';
		const cookies = typeof window !== 'undefined' && cookie.parse( document.cookie );
		const isEligibleForOlarkChat =
			! isLoggedIn && 'en' === locale && ! cookies?.hasOwnProperty( 'recognized_logins' );
		const isNewSearchAndFilter = config.isEnabled( 'themes/showcase-i4/search-and-filter' );

		// FIXME: Logged-in title should only be 'Themes'
		return (
			<div>
				<DocumentHead title={ title } meta={ metas } />
				<PageViewTracker
					path={ this.props.analyticsPath }
					title={ this.props.analyticsPageTitle }
					properties={ { is_logged_in: isLoggedIn } }
				/>
				<div className="themes__content" ref={ this.scrollRef }>
					<QueryThemeFilters />
					{ isNewSearchAndFilter ? (
						<SearchThemes query={ filterString + search } onSearch={ this.doSearch } />
					) : (
						<ThemesSearchCard
							onSearch={ this.doSearch }
							search={ filterString + search }
							tier={ tier }
							showTierThemesControl={ ! isMultisite }
							select={ this.onTierSelect }
						/>
					) }
					{ isLoggedIn && (
						<SectionNav className="themes__section-nav" selectedText={ this.state.tabFilter.text }>
							<NavTabs>
								{ Object.values( this.tabFilters )
									.sort( ( a, b ) => a.order - b.order )
									.map(
										( tabFilter ) =>
											this.shouldShowTab( tabFilter.key ) && (
												<NavItem
													key={ tabFilter.key }
													onClick={ () => this.onFilterClick( tabFilter ) }
													selected={ tabFilter.key === this.state.tabFilter.key }
													count={ this.notificationCount( tabFilter.key ) }
												>
													{ tabFilter.text }
												</NavItem>
											)
									) }
							</NavTabs>
						</SectionNav>
					) }
					{ this.renderBanner() }
					{ this.tabFilters.RECOMMENDED.key === this.state.tabFilter.key && (
						<RecommendedThemes { ...themeProps } />
					) }
					{ this.tabFilters.ALL.key === this.state.tabFilter.key &&
						this.allThemes( { themeProps } ) }
					{ this.tabFilters.MYTHEMES.key === this.state.tabFilter.key && (
						<ThemesSelection { ...themeProps } />
					) }
					{ this.tabFilters.TRENDING.key === this.state.tabFilter.key && (
						<TrendingThemes { ...themeProps } />
					) }
					{ siteId && <QuerySitePlans siteId={ siteId } /> }
					{ siteId && <QuerySitePurchases siteId={ siteId } /> }
					<ThanksModal source="list" />
					<AutoLoadingHomepageModal source="list" />
					<ThemePreview />
					{ isEligibleForOlarkChat && (
						<OlarkChat identity={ olarkIdentity } systemsGroupId={ olarkSystemsGroupId } />
					) }
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId, filter, tier, vertical } ) => {
	const currentThemeId = getActiveTheme( state, siteId );
	const currentTheme = getCanonicalTheme( state, siteId, currentThemeId );
	return {
		currentThemeId,
		currentTheme,
		isLoggedIn: isUserLoggedIn( state ),
		isAtomicSite: isAtomicSite( state, siteId ),
		isExpertBannerDissmissed: isUpworkBannerDismissed( state ),
		siteCanInstallThemes: siteHasFeature( state, siteId, FEATURE_INSTALL_THEMES ),
		siteSlug: getSiteSlug( state, siteId ),
		description: getThemeShowcaseDescription( state, { filter, tier, vertical } ),
		title: getThemeShowcaseTitle( state, { filter, tier, vertical } ),
		subjects: getThemeFilterTerms( state, 'subject' ) || {},
		filterString: prependThemeFilterKeys( state, filter ),
		filterToTermTable: getThemeFilterToTermTable( state ),
		themesBookmark: getThemesBookmark( state ),
		outdatedThemes: getOutdatedThemes( state, siteId ) || [],
		isUpsellCardDisplayed: isUpsellCardDisplayedSelector( state ),
	};
};

export default connect( mapStateToProps, null )( localize( ThemeShowcase ) );
