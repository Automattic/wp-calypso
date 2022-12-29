import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { FEATURE_INSTALL_THEMES } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { compact, omit, pickBy } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import UpworkBanner from 'calypso/blocks/upwork-banner';
import { isUpworkBannerDismissed } from 'calypso/blocks/upwork-banner/selector';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryThemeFilters from 'calypso/components/data/query-theme-filters';
import SearchThemes from 'calypso/components/search-themes';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import SimplifiedSegmentedControl from 'calypso/components/segmented-control/simplified';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { buildRelativeSearchUrl } from 'calypso/lib/build-url';
import AutoLoadingHomepageModal from 'calypso/my-sites/themes/auto-loading-homepage-modal';
import ThanksModal from 'calypso/my-sites/themes/thanks-modal';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getSiteFeaturesById from 'calypso/state/selectors/get-site-features';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	arePremiumThemesEnabled,
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
import ThemesToolbarGroup from './themes-toolbar-group';
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

		const isNewSearchAndFilter = config.isEnabled( 'themes/showcase-i4/search-and-filter' );

		// As the values of these filter is static and won't be changed, we use it to check a filter
		// is a static filter directly in the `isStaticFilter` function.
		this.staticFilters = {
			RECOMMENDED: {
				key: 'recommended',
				text: props.translate( 'Recommended' ),
				order: 1,
			},
			TRENDING: {
				key: 'trending',
				text: props.translate( 'Trending' ),
				order: 2,
			},
			MYTHEMES: {
				key: 'my-themes',
				text: props.translate( 'My Themes' ),
				order: 3,
			},
			ALL: {
				key: 'all',
				text: isNewSearchAndFilter ? props.translate( 'All' ) : props.translate( 'All Themes' ),
				order: 4,
			},
		};

		this.subjectFilters = this.getSubjectFilters( props );
		this.subjectTermTable = this.getSubjectTermTable( props );

		this.tiers = [
			{ value: 'all', label: props.translate( 'All' ) },
			{ value: 'free', label: props.translate( 'Free' ) },
			{ value: 'premium', label: props.translate( 'Premium' ) },
		];

		this.state = {
			tabFilter: this.getTabFilterFromUrl( props.filter ),
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

	isStaticFilter = ( tabFilter ) => Object.values( this.staticFilters ).includes( tabFilter );

	getSubjectFilters = ( props ) => {
		const { subjects } = props;
		return Object.fromEntries(
			Object.entries( subjects ).map( ( [ key, filter ] ) => [ key, { key, text: filter.name } ] )
		);
	};

	getTabFilters = () => {
		if ( this.props.siteId && ! this.props.areSiteFeaturesLoaded ) {
			return null;
		}

		const isNewSearchAndFilter = config.isEnabled( 'themes/showcase-i4/search-and-filter' );
		const shouldShowMyThemesFilter =
			( this.props.isJetpackSite && ! this.props.isAtomicSite ) ||
			( this.props.isAtomicSite && this.props.siteCanInstallThemes );

		return {
			...( ! isNewSearchAndFilter && {
				RECOMMENDED: this.staticFilters.RECOMMENDED,
			} ),
			...( ! isNewSearchAndFilter && {
				TRENDING: this.staticFilters.TRENDING,
			} ),
			...( shouldShowMyThemesFilter && {
				MYTHEMES: this.staticFilters.MYTHEMES,
			} ),
			ALL: this.staticFilters.ALL,
			...( isNewSearchAndFilter && this.subjectFilters ),
		};
	};

	getSubjectTermTable = ( { filterToTermTable } ) => {
		return Object.keys( filterToTermTable )
			.filter( ( key ) => key.indexOf( 'subject:' ) !== -1 )
			.reduce( ( obj, key ) => {
				obj[ key ] = filterToTermTable[ key ];
				return obj;
			}, {} );
	};

	findTabFilter = ( tabFilters, filterKey ) =>
		Object.values( tabFilters ).find( ( filter ) => filter.key === filterKey ) ||
		this.staticFilters.ALL;

	getTabFilterFromUrl = ( filterString = '' ) => {
		const filterArray = filterString.split( '+' );
		const matches = Object.values( this.subjectTermTable ).filter( ( value ) =>
			filterArray.includes( value )
		);

		if ( ! matches.length ) {
			return this.findTabFilter( this.staticFilters, this.state?.tabFilter.key );
		}

		const filterKey = matches[ matches.length - 1 ].split( ':' ).pop();
		return this.findTabFilter( this.subjectFilters, filterKey );
	};

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
		const filterString = compact( validFilters ).join( '+' );

		const url = this.constructUrl( {
			filter: filterString,
			// Strip filters and excess whitespace
			searchString: searchBoxContent.replace( filterRegex, '' ).replace( /\s+/g, ' ' ).trim(),
		} );

		this.setState( { tabFilter: this.getTabFilterFromUrl( filterString ) } );
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
		// Due to the search backend limitation, static filters other than "All"
		// can only have "All" tier.
		if (
			tier !== 'all' &&
			this.isStaticFilter( this.state.tabFilter ) &&
			this.state.tabFilter.key !== this.staticFilters.ALL.key
		) {
			this.setState( { tabFilter: this.staticFilters.ALL } );
		}

		recordTracksEvent( 'calypso_themeshowcase_filter_pricing_click', { tier } );
		trackClick( 'search bar filter', tier );

		const url = this.constructUrl( { tier } );
		page( url );
		this.scrollToSearchInput();
	};

	onFilterClick = ( tabFilter ) => {
		const isNewSearchAndFilter = config.isEnabled( 'themes/showcase-i4/search-and-filter' );

		recordTracksEvent( 'calypso_themeshowcase_filter_category_click', { category: tabFilter.key } );
		trackClick( 'section nav filter', tabFilter );

		let callback = () => null;
		// Due to the search backend limitation, static filters other than "All"
		// can only have "All" tier.
		if (
			this.isStaticFilter( tabFilter ) &&
			tabFilter.key !== this.staticFilters.ALL.key &&
			this.props.tier !== 'all'
		) {
			callback = () => {
				this.onTierSelect( { value: 'all' } );
				this.scrollToSearchInput();
			};
		}

		if ( isNewSearchAndFilter ) {
			const { filter = '', search, filterToTermTable } = this.props;
			const subjectTerm = filterToTermTable[ `subject:${ tabFilter.key }` ];
			const subjectFilters = Object.values( this.subjectTermTable );
			const filterWithoutSubjects = filter
				.split( '+' )
				.filter( ( key ) => ! subjectFilters.includes( key ) )
				.join( '+' );

			const newFilter = ! this.isStaticFilter( tabFilter )
				? [ filterWithoutSubjects, subjectTerm ].join( '+' )
				: filterWithoutSubjects;

			page( this.constructUrl( { filter: newFilter, searchString: search } ) );
		}

		this.setState( { tabFilter }, callback );
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

	notificationCount = ( key ) => {
		switch ( key ) {
			case this.staticFilters.MYTHEMES?.key:
				return this.props.outdatedThemes.length || null;
			case this.staticFilters.RECOMMENDED?.key:
			case this.staticFilters.TRENDING?.key:
			case this.staticFilters.ALL.key:
				return null;
		}
	};

	recordSearchThemesTracksEvent = ( action, props ) => {
		let eventName;
		switch ( action ) {
			case 'search_clear_icon_click':
				eventName = 'calypso_themeshowcase_search_clear_icon_click';
				break;
			case 'search_dropdown_taxonomy_click':
				eventName = 'calypso_themeshowcase_search_dropdown_taxonomy_click';
				break;
			case 'search_dropdown_taxonomy_term_click':
				eventName = 'calypso_themeshowcase_search_dropdown_taxonomy_term_click';
				break;
			case 'search_dropdown_view_all_button_click':
				eventName = 'calypso_themeshowcase_search_dropdown_view_all_button_click';
				break;
			case 'search_dropdown_view_less_button_click':
				eventName = 'calypso_themeshowcase_search_dropdown_view_less_button_click';
				break;
		}

		if ( eventName ) {
			recordTracksEvent( eventName, props );
		}
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
			tabKey !== this.staticFilters.MYTHEMES?.key &&
			! isExpertBannerDissmissed &&
			! loggedOutComponent
		) {
			// these are from the time we rely on the redirect.
			// See p2-pau2Xa-4nq#comment-12480
			let location = 'theme-banner';
			let utmCampaign = 'built-by-wordpress-com-redirect';

			// See p2-pau2Xa-4nq#comment-12458 for the context regarding the utm campaign value.
			switch ( tabKey ) {
				case this.staticFilters.RECOMMENDED?.key:
					location = 'recommended-theme-banner';
					utmCampaign = 'theme-rec-tre';
					break;
				case this.staticFilters.TRENDING?.key:
					location = 'trending-theme-banner';
					utmCampaign = 'theme-rec-tre';
					break;
				case this.staticFilters.ALL.key:
					location = 'all-theme-banner';
					utmCampaign = 'theme-all';
			}

			return <UpworkBanner location={ location } utmCampaign={ utmCampaign } />;
		}

		return upsellBanner;
	};

	renderThemes = ( themeProps ) => {
		const tabKey = this.state.tabFilter.key;
		switch ( tabKey ) {
			case this.staticFilters.RECOMMENDED?.key:
				return <RecommendedThemes { ...themeProps } />;
			case this.staticFilters.MYTHEMES?.key:
				return <ThemesSelection { ...themeProps } />;
			case this.staticFilters.TRENDING?.key:
				return <TrendingThemes { ...themeProps } />;
			default:
				return this.allThemes( { themeProps } );
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
			premiumThemesEnabled,
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

		const isNewSearchAndFilter = config.isEnabled( 'themes/showcase-i4/search-and-filter' );

		const tabFilters = this.getTabFilters();

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
						<SearchThemes
							query={ filterString + search }
							onSearch={ this.doSearch }
							recordTracksEvent={ this.recordSearchThemesTracksEvent }
						/>
					) : (
						<ThemesSearchCard
							onSearch={ this.doSearch }
							search={ filterString + search }
							tier={ tier }
							showTierThemesControl={ ! isMultisite }
							select={ this.onTierSelect }
						/>
					) }
					{ isNewSearchAndFilter && tabFilters && (
						<div className="theme__filters">
							<ThemesToolbarGroup
								items={ Object.values( tabFilters ) }
								selectedKey={ this.state.tabFilter.key }
								onSelect={ ( key ) =>
									this.onFilterClick(
										Object.values( tabFilters ).find( ( tabFilter ) => tabFilter.key === key )
									)
								}
							/>
							{ premiumThemesEnabled && ! isMultisite && (
								<SimplifiedSegmentedControl
									key={ tier }
									initialSelected={ tier || 'all' }
									options={ this.tiers }
									onSelect={ this.onTierSelect }
								/>
							) }
						</div>
					) }
					{ isLoggedIn && ! isNewSearchAndFilter && (
						<SectionNav className="themes__section-nav" selectedText={ this.state.tabFilter.text }>
							<NavTabs>
								{ Object.values( tabFilters )
									.sort( ( a, b ) => a.order - b.order )
									.map( ( tabFilter ) => (
										<NavItem
											key={ tabFilter.key }
											onClick={ () => this.onFilterClick( tabFilter ) }
											selected={ tabFilter.key === this.state.tabFilter.key }
											count={ this.notificationCount( tabFilter.key ) }
										>
											{ tabFilter.text }
										</NavItem>
									) ) }
							</NavTabs>
						</SectionNav>
					) }
					{ this.renderBanner() }
					{ this.renderThemes( themeProps ) }
					{ siteId && <QuerySitePlans siteId={ siteId } /> }
					{ siteId && <QuerySitePurchases siteId={ siteId } /> }
					<QueryProductsList />
					<ThanksModal source="list" />
					<AutoLoadingHomepageModal source="list" />
					<ThemePreview />
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId, filter, tier, vertical } ) => {
	const currentThemeId = getActiveTheme( state, siteId );
	const currentTheme = getCanonicalTheme( state, siteId, currentThemeId );
	const allowedSubjects = omit( getThemeFilterTerms( state, 'subject' ) || {}, [ 'newsletter' ] );

	return {
		currentThemeId,
		currentTheme,
		isLoggedIn: isUserLoggedIn( state ),
		isAtomicSite: isAtomicSite( state, siteId ),
		isExpertBannerDissmissed: isUpworkBannerDismissed( state ),
		areSiteFeaturesLoaded: !! getSiteFeaturesById( state, siteId ),
		siteCanInstallThemes: siteHasFeature( state, siteId, FEATURE_INSTALL_THEMES ),
		siteSlug: getSiteSlug( state, siteId ),
		description: getThemeShowcaseDescription( state, { filter, tier, vertical } ),
		title: getThemeShowcaseTitle( state, { filter, tier, vertical } ),
		subjects: allowedSubjects,
		premiumThemesEnabled: arePremiumThemesEnabled( state, siteId ),
		filterString: prependThemeFilterKeys( state, filter ),
		filterToTermTable: getThemeFilterToTermTable( state ),
		themesBookmark: getThemesBookmark( state ),
		outdatedThemes: getOutdatedThemes( state, siteId ) || [],
		isUpsellCardDisplayed: isUpsellCardDisplayedSelector( state ),
	};
};

export default connect( mapStateToProps, null )( localize( ThemeShowcase ) );
