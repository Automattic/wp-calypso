import { FEATURE_UPLOAD_THEMES } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { compact, pickBy } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import UpworkBanner from 'calypso/blocks/upwork-banner';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryThemeFilters from 'calypso/components/data/query-theme-filters';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { buildRelativeSearchUrl } from 'calypso/lib/build-url';
import AutoLoadingHomepageModal from 'calypso/my-sites/themes/auto-loading-homepage-modal';
import ThanksModal from 'calypso/my-sites/themes/thanks-modal';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import hasActiveSiteFeature from 'calypso/state/selectors/has-active-site-feature';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	getActiveTheme,
	getCanonicalTheme,
	getThemeFilterTerms,
	getThemeFilterToTermTable,
	getThemeShowcaseDescription,
	getThemeShowcaseTitle,
	prependThemeFilterKeys,
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
		canUploadThemes: PropTypes.bool,
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
		siteSlug: PropTypes.string,
		upsellBanner: PropTypes.any,
		trackMoreThemesClick: PropTypes.func,
		loggedOutComponent: PropTypes.bool,
		isAtomicSite: PropTypes.bool,
		isJetpackSite: PropTypes.bool,
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

	expertsBanner = () => {
		const { currentThemeId, loggedOutComponent, siteId, isLoggedIn } = this.props;
		const showBanners = currentThemeId || ! siteId || ! isLoggedIn;
		if ( loggedOutComponent || ! showBanners ) {
			return;
		}
		return <UpworkBanner location={ 'theme-banner' } />;
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
					this.props.isJetpackSite || ( this.props.isAtomicSite && this.props.canUploadThemes )
				);
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
		const tier = '';

		const canonicalUrl = 'https://wordpress.com' + pathName;

		const metas = [
			{ name: 'description', property: 'og:description', content: this.props.description },
			{ property: 'og:title', content: title },
			{ property: 'og:url', content: canonicalUrl },
			{ property: 'og:type', content: 'website' },
			{ property: 'og:site_name', content: 'WordPress.com' },
		];

		const themeProps = {
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

		// FIXME: Logged-in title should only be 'Themes'
		return (
			<div>
				<DocumentHead title={ title } meta={ metas } />
				<PageViewTracker
					path={ this.props.analyticsPath }
					title={ this.props.analyticsPageTitle }
				/>
				<div className="themes__content" ref={ this.scrollRef }>
					<QueryThemeFilters />
					<ThemesSearchCard
						onSearch={ this.doSearch }
						search={ filterString + search }
						tier={ tier }
						showTierThemesControl={ ! isMultisite }
						select={ this.onTierSelect }
					/>
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
												>
													{ tabFilter.text }
												</NavItem>
											)
									) }
							</NavTabs>
						</SectionNav>
					) }
					{ this.props.upsellBanner }
					{ 'recommended' === this.state.tabFilter.key && <RecommendedThemes { ...themeProps } /> }
					{ 'all' === this.state.tabFilter.key && this.expertsBanner() }
					{ 'all' === this.state.tabFilter.key && this.allThemes( { themeProps } ) }
					{ 'my-themes' === this.state.tabFilter.key && <ThemesSelection { ...themeProps } /> }
					{ 'trending' === this.state.tabFilter.key && <TrendingThemes { ...themeProps } /> }
					{ siteId && <QuerySitePlans siteId={ siteId } /> }
					{ siteId && <QuerySitePurchases siteId={ siteId } /> }
					<ThanksModal source={ 'list' } />
					<AutoLoadingHomepageModal source={ 'list' } />
					<ThemePreview />
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId, filter, tier, vertical } ) => {
	const currentThemeId = getActiveTheme( state, siteId );
	const currentTheme = getCanonicalTheme( state, siteId, currentThemeId );
	return {
		canUploadThemes: hasActiveSiteFeature( state, siteId, FEATURE_UPLOAD_THEMES ),
		currentThemeId,
		currentTheme,
		isLoggedIn: isUserLoggedIn( state ),
		isAtomicSite: isAtomicSite( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
		description: getThemeShowcaseDescription( state, { filter, tier, vertical } ),
		title: getThemeShowcaseTitle( state, { filter, tier, vertical } ),
		subjects: getThemeFilterTerms( state, 'subject' ) || {},
		filterString: prependThemeFilterKeys( state, filter ),
		filterToTermTable: getThemeFilterToTermTable( state ),
		themesBookmark: getThemesBookmark( state ),
	};
};

export default connect( mapStateToProps, null )( localize( ThemeShowcase ) );
