import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { FEATURE_INSTALL_THEMES } from '@automattic/calypso-products';
import classNames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import { compact, pickBy } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryThemeFilters from 'calypso/components/data/query-theme-filters';
import { SearchThemes, SearchThemesV2 } from 'calypso/components/search-themes';
import SelectDropdown from 'calypso/components/select-dropdown';
import { getOptionLabel } from 'calypso/landing/subscriptions/helpers';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { buildRelativeSearchUrl } from 'calypso/lib/build-url';
import ActivationModal from 'calypso/my-sites/themes/activation-modal';
import ThemeCollectionViewHeader from 'calypso/my-sites/themes/collections/theme-collection-view-header';
import ThemeCollectionsLayout from 'calypso/my-sites/themes/collections/theme-collections-layout';
import ThanksModal from 'calypso/my-sites/themes/thanks-modal';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getSiteFeaturesById from 'calypso/state/selectors/get-site-features';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isSiteOnWooExpress, isSiteOnECommerceTrial } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { setBackPath } from 'calypso/state/themes/actions';
import {
	arePremiumThemesEnabled,
	getThemeFilterTerms,
	getThemeFilterToTermTable,
	prependThemeFilterKeys,
	isUpsellCardDisplayed as isUpsellCardDisplayedSelector,
} from 'calypso/state/themes/selectors';
import { getThemesBookmark } from 'calypso/state/themes/themes-ui/selectors';
import EligibilityWarningModal from './atomic-transfer-dialog';
import { addTracking, getSubjectsFromTermTable, trackClick, localizeThemesPath } from './helpers';
import ThemePreview from './theme-preview';
import ThemeShowcaseHeader from './theme-showcase-header';
import ThemesSelection from './themes-selection';
import ThemesToolbarGroup from './themes-toolbar-group';
import './theme-showcase.scss';

const optionShape = PropTypes.shape( {
	label: PropTypes.string,
	header: PropTypes.string,
	getUrl: PropTypes.func,
	action: PropTypes.func,
} );

const staticFilters = {
	MYTHEMES: {
		key: 'my-themes',
		text: translate( 'My Themes' ),
	},
	RECOMMENDED: {
		key: 'recommended',
		text: translate( 'Recommended' ),
	},
	DISCOVER: {
		key: 'discover',
		text: translate( 'Discover' ),
	},
	ALL: {
		key: 'all',
		text: translate( 'All' ),
	},
};

class ThemeShowcase extends Component {
	constructor( props ) {
		super( props );
		this.scrollRef = createRef();
		this.bookmarkRef = createRef();

		this.subjectFilters = this.getSubjectFilters( props );
		this.subjectTermTable = getSubjectsFromTermTable( props.filterToTermTable );
	}

	static propTypes = {
		tier: PropTypes.oneOf( [ '', 'free', 'premium', 'marketplace' ] ),
		search: PropTypes.string,
		isCollectionView: PropTypes.bool,
		pathName: PropTypes.string,
		// Connected props
		options: PropTypes.objectOf( optionShape ),
		defaultOption: optionShape,
		secondaryOption: optionShape,
		getScreenshotOption: PropTypes.func,
		siteCanInstallThemes: PropTypes.bool,
		siteSlug: PropTypes.string,
		upsellBanner: PropTypes.any,
		loggedOutComponent: PropTypes.bool,
		isAtomicSite: PropTypes.bool,
		isJetpackSite: PropTypes.bool,
		isSiteECommerceFreeTrial: PropTypes.bool,
		isSiteWooExpress: PropTypes.bool,
		isSiteWooExpressOrEcomFreeTrial: PropTypes.bool,
	};

	static defaultProps = {
		tier: '',
		search: '',
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

	componentWillUnmount() {
		this.props.setBackPath( this.constructUrl() );
	}

	isThemeDiscoveryEnabled = () =>
		( this.props.isLoggedIn && config.isEnabled( 'themes/discovery-lits' ) ) ||
		( ! this.props.isLoggedIn && config.isEnabled( 'themes/discovery-lots' ) );

	getDefaultStaticFilter = () =>
		config.isEnabled( 'themes/discovery-lots' )
			? staticFilters.DISCOVER
			: staticFilters.RECOMMENDED;

	isStaticFilter = ( tabFilter ) => {
		return Object.values( staticFilters ).some(
			( staticFilter ) => tabFilter.key === staticFilter.key
		);
	};

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

		const shouldShowMyThemesFilter =
			( this.props.isJetpackSite && ! this.props.isAtomicSite ) ||
			( this.props.isAtomicSite && this.props.siteCanInstallThemes );

		return {
			...( config.isEnabled( 'themes/discovery-lots' )
				? { DISCOVER: staticFilters.DISCOVER }
				: {} ),
			...( shouldShowMyThemesFilter && { MYTHEMES: staticFilters.MYTHEMES } ),
			RECOMMENDED: staticFilters.RECOMMENDED,
			ALL: staticFilters.ALL,
			...this.subjectFilters,
		};
	};

	getTiers = () => {
		const { isSiteWooExpressOrEcomFreeTrial } = this.props;
		const tiers = [
			{ value: 'all', label: this.props.translate( 'All' ) },
			{ value: 'free', label: this.props.translate( 'Free' ) },
		];

		if ( ! isSiteWooExpressOrEcomFreeTrial ) {
			tiers.push( { value: 'premium', label: this.props.translate( 'Premium' ) } );
		}

		tiers.push( {
			value: 'marketplace',
			label: this.props.translate( 'Partner', {
				context: 'This theme is developed and supported by a theme partner',
			} ),
		} );

		return tiers;
	};

	findTabFilter = ( tabFilters, filterKey ) =>
		Object.values( tabFilters ).find( ( filter ) => filter.key === filterKey ) ||
		this.getDefaultStaticFilter();

	getSelectedTabFilter = () => {
		const filter = this.props.filter ?? '';
		const filterArray = filter.split( '+' );
		const matches = Object.values( this.subjectTermTable ).filter( ( value ) =>
			filterArray.includes( value )
		);

		if ( ! matches.length ) {
			return this.findTabFilter( staticFilters, this.props.category );
		}

		const filterKey = matches[ matches.length - 1 ].split( ':' ).pop();
		return this.findTabFilter( this.subjectFilters, filterKey );
	};

	scrollToSearchInput = () => {
		let y = 0;

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

			y = elementBoundary.top + window.pageYOffset + yOffset;
		}

		window.scrollTo( { top: y } );
	};

	doSearch = ( searchBoxContent ) => {
		const filterRegex = /([\w-]*):([\w-]*)/g;
		const { filterToTermTable, subjectStringFilter, isSearchV2 } = this.props;

		const filters =
			`${ searchBoxContent } ${ isSearchV2 ? subjectStringFilter : '' }`.match( filterRegex ) || [];

		const validFilters = filters.map( ( filter ) => filterToTermTable[ filter ] );
		const filterString = compact( validFilters ).join( '+' );

		const search = searchBoxContent.replace( filterRegex, '' ).replace( /\s+/g, ' ' ).trim();

		const url = this.constructUrl( {
			filter: filterString,
			// Strip filters and excess whitespace
			search,
			// If a category isn't selected we search in the all category.
			...( search &&
				! subjectStringFilter && {
					category: staticFilters.ALL.key,
				} ),
		} );

		page( url );
		this.scrollToSearchInput();
	};

	/**
	 * Returns a full showcase url from current props.
	 * @param {Object} sections fields from this object will override current props.
	 * @param {string} sections.vertical override vertical prop
	 * @param {string} sections.tier override tier prop
	 * @param {string} sections.filter override filter prop
	 * @param {string} sections.siteSlug override siteSlug prop
	 * @param {string} sections.search override search prop
	 * @param {string} sections.isCollectionView should display the collection view.
	 * @returns {string} Theme showcase url
	 */
	constructUrl = ( sections ) => {
		const {
			category,
			vertical,
			tier,
			filter,
			siteSlug,
			search,
			locale,
			isLoggedIn,
			isCollectionView,
		} = {
			...this.props,
			...sections,
		};
		const siteIdSection = siteSlug ? `/${ siteSlug }` : '';
		const categorySection =
			category && category !== this.getDefaultStaticFilter().key ? `/${ category }` : '';
		const verticalSection = vertical ? `/${ vertical }` : '';
		const tierSection = tier && tier !== 'all' ? `/${ tier }` : '';

		let filterSection = filter ? `/filter/${ filter }` : '';
		filterSection = filterSection.replace( /\s/g, '+' );

		const collectionSection = isCollectionView ? `/collection` : '';

		let url = `/themes${ categorySection }${ verticalSection }${ tierSection }${ filterSection }${ collectionSection }${ siteIdSection }`;

		url = localizeThemesPath( url, locale, ! isLoggedIn );

		return buildRelativeSearchUrl( url, search );
	};

	onTierSelectFilter = ( { value: tier } ) => {
		recordTracksEvent( 'calypso_themeshowcase_filter_pricing_click', { tier } );
		trackClick( 'search bar filter', tier );

		const category =
			tier !== 'all' && ! this.props.category ? staticFilters.RECOMMENDED.key : this.props.category;

		const url = this.constructUrl( {
			tier,
			category,
			// Due to the search backend limitation, "My Themes" can only have "All" tier.
			...( tier !== 'all' &&
				this.props.category === staticFilters.MYTHEMES.key && {
					category: staticFilters.RECOMMENDED.key,
				} ),
		} );

		page( url );
		this.scrollToSearchInput();
	};

	onFilterClick = ( tabFilter ) => {
		recordTracksEvent( 'calypso_themeshowcase_filter_category_click', { category: tabFilter.key } );
		trackClick( 'section nav filter', tabFilter );

		const { filter = '', filterToTermTable } = this.props;
		const subjectFilters = Object.values( this.subjectTermTable );
		const filterWithoutSubjects = filter
			.split( '+' )
			.filter( ( key ) => ! subjectFilters.includes( key ) )
			.join( '+' );

		const newUrlParams = {};

		if ( this.isStaticFilter( tabFilter ) ) {
			newUrlParams.category = tabFilter.key;
			newUrlParams.filter = filterWithoutSubjects;
			// Due to the search backend limitation, "My Themes" can only have "All" tier.
			if ( tabFilter.key === staticFilters.MYTHEMES.key && this.props.tier !== 'all' ) {
				newUrlParams.tier = 'all';
			}

			if ( tabFilter.key === staticFilters.DISCOVER.key ) {
				newUrlParams.category = null;
				newUrlParams.filter = null;
				newUrlParams.tier = 'all';
				newUrlParams.search = null;
			}
		} else {
			const subjectTerm = filterToTermTable[ `subject:${ tabFilter.key }` ];
			newUrlParams.filter = [ filterWithoutSubjects, subjectTerm ].join( '+' );
			newUrlParams.category = null;
		}

		page( this.constructUrl( newUrlParams ) );

		this.scrollToSearchInput();
	};

	allThemes = ( { themeProps } ) => {
		const { filter, isCollectionView, isJetpackSite, tier, children } = this.props;
		if ( isJetpackSite ) {
			return children;
		}

		// In Collection View of pricing tiers (e.g. Partner themes), prevent requesting only recommended themes.
		const themesSelectionProps = {
			...themeProps,
			...( isCollectionView && tier && ! filter && { tabFilter: '' } ),
		};

		return (
			<div className="theme-showcase__all-themes">
				<ThemesSelection { ...themesSelectionProps } />
			</div>
		);
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
		const { loggedOutComponent, upsellBanner, isUpsellCardDisplayed, isSiteECommerceFreeTrial } =
			this.props;

		// Don't show the banner if there is already an upsell card displayed
		if ( isUpsellCardDisplayed ) {
			return null;
		}

		// In ecommerce trial sites, we only want to show upsell banner.
		if ( isSiteECommerceFreeTrial ) {
			if ( upsellBanner ) {
				return upsellBanner;
			}
			return null;
		}

		if ( config.isEnabled( 'jitms' ) && ! loggedOutComponent ) {
			return (
				<AsyncLoad
					require="calypso/blocks/jitm"
					placeholder={ null }
					messagePath="calypso:themes:showcase-website-design"
				/>
			);
		}

		return upsellBanner;
	};

	renderThemes = ( themeProps ) => {
		const tabKey = this.getSelectedTabFilter().key;

		const showCollections = this.props.tier === '' && this.isThemeDiscoveryEnabled();

		switch ( tabKey ) {
			case staticFilters.MYTHEMES?.key:
				return <ThemesSelection { ...themeProps } />;
			case staticFilters.DISCOVER.key:
				if ( showCollections && ! this.props.isCollectionView ) {
					return (
						<ThemeCollectionsLayout
							getOptions={ this.getThemeOptions }
							getScreenshotUrl={ this.getScreenshotUrl }
							getActionLabel={ this.getActionLabel }
							onSeeAll={ this.onCollectionSeeAll }
						/>
					);
				}
			default:
				return this.allThemes( { themeProps } );
		}
	};

	getScreenshotUrl = ( theme, themeOptions ) => {
		const { getScreenshotOption, locale, isLoggedIn } = this.props;

		if ( ! getScreenshotOption( theme ).getUrl ) {
			return null;
		}

		return localizeThemesPath(
			getScreenshotOption( theme ).getUrl( theme, themeOptions ),
			locale,
			! isLoggedIn
		);
	};

	getActionLabel = ( theme ) => this.props.getScreenshotOption( theme ).label;
	getThemeOptions = ( theme ) => {
		return pickBy(
			addTracking( this.props.options ),
			( option ) => ! ( option.hideForTheme && option.hideForTheme( theme, this.props.siteId ) )
		);
	};

	onCollectionSeeAll = ( { filter = '', tier = '' } ) => {
		const url = this.constructUrl( {
			isCollectionView: true,
			filter,
			tier,
		} );

		page( url );
		window.scrollTo( { top: 0 } );
	};

	render() {
		const {
			siteId,
			getScreenshotOption,
			search,
			filter,
			isLoggedIn,
			isSearchV2,
			pathName,
			featureStringFilter,
			filterString,
			isMultisite,
			premiumThemesEnabled,
			isSiteWooExpressOrEcomFreeTrial,
			isCollectionView,
		} = this.props;
		const tier = this.props.tier || 'all';
		const canonicalUrl = 'https://wordpress.com' + pathName;

		const themeProps = {
			forceWpOrgSearch: true,
			filter: filter,
			vertical: this.props.vertical,
			siteId: this.props.siteId,
			upsellUrl: this.props.upsellUrl,
			upsellBanner: this.props.upsellBanner,
			search: search,
			tier: this.props.tier,
			tabFilter: this.getSelectedTabFilter().key,
			defaultOption: this.props.defaultOption,
			secondaryOption: this.props.secondaryOption,
			placeholderCount: this.props.placeholderCount,
			bookmarkRef: this.bookmarkRef,
			getScreenshotUrl: this.getScreenshotUrl,
			onScreenshotClick: ( themeId ) => {
				if ( ! getScreenshotOption( themeId ).action ) {
					return;
				}
				getScreenshotOption( themeId ).action( themeId );
			},
			getActionLabel: this.getActionLabel,
			trackScrollPage: this.props.trackScrollPage,
			scrollToSearchInput: this.scrollToSearchInput,
			getOptions: this.getThemeOptions,
		};

		const tabFilters = this.getTabFilters();
		const tiers = this.getTiers();

		const classnames = classNames( 'theme-showcase', {
			'is-discovery-view':
				this.props.tier === '' && this.isThemeDiscoveryEnabled() && ! isCollectionView,
			'is-collection-view': isCollectionView,
		} );

		return (
			<div className={ classnames }>
				<PageViewTracker
					path={ this.props.analyticsPath }
					title={ this.props.analyticsPageTitle }
					properties={ { is_logged_in: isLoggedIn } }
				/>
				<ThemeShowcaseHeader
					canonicalUrl={ canonicalUrl }
					filter={ this.props.filter }
					tier={ this.props.tier }
					vertical={ this.props.vertical }
					isCollectionView={ isCollectionView }
					noIndex={ isCollectionView }
				/>
				<div className="themes__content" ref={ this.scrollRef }>
					<QueryThemeFilters />
					{ isSiteWooExpressOrEcomFreeTrial && (
						<div className="themes__showcase">{ this.renderBanner() }</div>
					) }
					{ ! isCollectionView && (
						<div className="themes__controls">
							<div className="theme__search">
								<div className="theme__search-input">
									{ isSearchV2 ? (
										<SearchThemesV2
											query={ featureStringFilter + search }
											onSearch={ this.doSearch }
										/>
									) : (
										<SearchThemes
											query={ filterString + search }
											onSearch={ this.doSearch }
											recordTracksEvent={ this.recordSearchThemesTracksEvent }
										/>
									) }
								</div>
								{ tabFilters && premiumThemesEnabled && ! isMultisite && (
									<SelectDropdown
										className="section-nav-tabs__dropdown"
										onSelect={ this.onTierSelectFilter }
										selectedText={ translate( 'View: %s', {
											args: getOptionLabel( tiers, tier ) || '',
										} ) }
										options={ tiers }
										initialSelected={ tier }
									></SelectDropdown>
								) }
							</div>
							{ tabFilters && ! isSiteWooExpressOrEcomFreeTrial && (
								<ThemesToolbarGroup
									items={ Object.values( tabFilters ) }
									selectedKey={ this.getSelectedTabFilter().key }
									onSelect={ ( key ) =>
										this.onFilterClick(
											Object.values( tabFilters ).find( ( tabFilter ) => tabFilter.key === key )
										)
									}
								/>
							) }
						</div>
					) }
					{ isCollectionView && (
						<ThemeCollectionViewHeader
							backUrl={ this.constructUrl( {
								isCollectionView: false,
								tier: '',
								filter: '',
								category: this.getDefaultStaticFilter().key,
							} ) }
							filter={ this.props.filter }
							tier={ this.props.tier }
						/>
					) }
					<div className="themes__showcase">
						{ ! isSiteWooExpressOrEcomFreeTrial && this.renderBanner() }
						{ this.renderThemes( themeProps ) }
					</div>
					{ siteId && <QuerySitePlans siteId={ siteId } /> }
					{ siteId && <QuerySitePurchases siteId={ siteId } /> }
					<QueryProductsList />
					<ThanksModal source="list" />
					<ActivationModal source="list" />
					<EligibilityWarningModal />
					<ThemePreview />
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId, filter } ) => {
	return {
		isLoggedIn: isUserLoggedIn( state ),
		isAtomicSite: isAtomicSite( state, siteId ),
		areSiteFeaturesLoaded: !! getSiteFeaturesById( state, siteId ),
		siteCanInstallThemes: siteHasFeature( state, siteId, FEATURE_INSTALL_THEMES ),
		siteSlug: getSiteSlug( state, siteId ),
		subjects: getThemeFilterTerms( state, 'subject' ) || {},
		premiumThemesEnabled: arePremiumThemesEnabled( state, siteId ),
		filterString: prependThemeFilterKeys( state, filter ),
		featureStringFilter: prependThemeFilterKeys( state, filter, [ 'subject' ] ),
		subjectStringFilter: prependThemeFilterKeys( state, filter, [], [ 'subject' ] ),
		filterToTermTable: getThemeFilterToTermTable( state ),
		themesBookmark: getThemesBookmark( state ),
		isUpsellCardDisplayed: isUpsellCardDisplayedSelector( state ),
		isSiteECommerceFreeTrial: isSiteOnECommerceTrial( state, siteId ),
		isSiteWooExpress: isSiteOnWooExpress( state, siteId ),
		isSiteWooExpressOrEcomFreeTrial:
			isSiteOnECommerceTrial( state, siteId ) || isSiteOnWooExpress( state, siteId ),
		isSearchV2: ! isUserLoggedIn( state ) && config.isEnabled( 'themes/text-search-lots' ),
	};
};

export default connect( mapStateToProps, { setBackPath } )( localize( ThemeShowcase ) );
