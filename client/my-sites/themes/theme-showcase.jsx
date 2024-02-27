import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { FEATURE_INSTALL_THEMES } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { SelectDropdown } from '@automattic/components';
import { isAssemblerSupported } from '@automattic/design-picker';
import classNames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import { compact, pickBy } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryThemeFilters from 'calypso/components/data/query-theme-filters';
import { SearchThemes, SearchThemesV2 } from 'calypso/components/search-themes';
import { THEME_TIERS } from 'calypso/components/theme-tier/constants';
import getSiteAssemblerUrl from 'calypso/components/themes-list/get-site-assembler-url';
import { getOptionLabel } from 'calypso/landing/subscriptions/helpers';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import ActivationModal from 'calypso/my-sites/themes/activation-modal';
import { THEME_COLLECTIONS } from 'calypso/my-sites/themes/collections/collection-definitions';
import ShowcaseThemeCollection from 'calypso/my-sites/themes/collections/showcase-theme-collection';
import ThemeCollectionViewHeader from 'calypso/my-sites/themes/collections/theme-collection-view-header';
import ThemeShowcaseSurvey, { SurveyType } from 'calypso/my-sites/themes/survey';
import ThanksModal from 'calypso/my-sites/themes/thanks-modal';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getLastNonEditorRoute from 'calypso/state/selectors/get-last-non-editor-route';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import getSiteFeaturesById from 'calypso/state/selectors/get-site-features';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isSiteOnWooExpress, isSiteOnECommerceTrial } from 'calypso/state/sites/plans/selectors';
import { getSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { setBackPath } from 'calypso/state/themes/actions';
import { STATIC_FILTERS, DEFAULT_STATIC_FILTER } from 'calypso/state/themes/constants';
import {
	arePremiumThemesEnabled,
	getThemeFilterTerms,
	getThemeFilterToTermTable,
	prependThemeFilterKeys,
	isUpsellCardDisplayed as isUpsellCardDisplayedSelector,
	getThemeTiers,
} from 'calypso/state/themes/selectors';
import { getThemesBookmark } from 'calypso/state/themes/themes-ui/selectors';
import EligibilityWarningModal from './atomic-transfer-dialog';
import {
	addTracking,
	getSubjectsFromTermTable,
	trackClick,
	localizeThemesPath,
	isStaticFilter,
	constructThemeShowcaseUrl,
} from './helpers';
import PatternAssemblerButton from './pattern-assembler-button';
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
		key: STATIC_FILTERS.MYTHEMES,
		text: translate( 'My Themes' ),
	},
	RECOMMENDED: {
		key: STATIC_FILTERS.RECOMMENDED,
		text: translate( 'Recommended' ),
	},
	ALL: {
		key: STATIC_FILTERS.ALL,
		text: translate( 'All' ),
	},
};

const defaultStaticFilter = Object.values( staticFilters ).find(
	( staticFilter ) => staticFilter.key === DEFAULT_STATIC_FILTER
);

class ThemeShowcase extends Component {
	constructor( props ) {
		super( props );
		this.scrollRef = createRef();
		this.bookmarkRef = createRef();

		this.subjectFilters = this.getSubjectFilters( props );
		this.subjectTermTable = getSubjectsFromTermTable( props.filterToTermTable );
	}

	static propTypes = {
		tier: PropTypes.oneOf( [ '', ...Object.keys( THEME_TIERS ) ] ),
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

	isThemeDiscoveryEnabled = () => config.isEnabled( 'themes/discovery' );

	getDefaultStaticFilter = () => defaultStaticFilter;

	isStaticFilter = ( tabFilter ) => isStaticFilter( tabFilter.key );

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

		if ( this.props.isSiteWooExpress ) {
			return {
				MYTHEMES: staticFilters.MYTHEMES,
				RECOMMENDED: {
					...staticFilters.RECOMMENDED,
					text: translate( 'All Themes' ),
				},
			};
		}

		const shouldShowMyThemesFilter = !! this.props.siteId;

		return {
			...( shouldShowMyThemesFilter && { MYTHEMES: staticFilters.MYTHEMES } ),
			RECOMMENDED: staticFilters.RECOMMENDED,
			ALL: staticFilters.ALL,
			...this.subjectFilters,
		};
	};

	getTiers = () => {
		const { themeTiers } = this.props;

		const tiers = Object.keys( themeTiers ).reduce( ( availableTiers, tier ) => {
			if ( ! THEME_TIERS[ tier ]?.isFilterable ) {
				return availableTiers;
			}
			return [
				...availableTiers,
				{
					value: tier,
					label: THEME_TIERS[ tier ].label,
				},
			];
		}, [] );

		return [ { value: 'all', label: translate( 'All' ) }, ...tiers ];
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
			...( ( this.isThemeDiscoveryEnabled() && ! this.props.category && search ) ||
				( filterString && {
					category: staticFilters.ALL.key,
				} ) ),
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
		return constructThemeShowcaseUrl( {
			...this.props,
			...sections,
		} );
	};

	onTierSelectFilter = ( { value: tier } ) => {
		recordTracksEvent( 'calypso_themeshowcase_filter_pricing_click', { tier } );
		trackClick( 'search bar filter', tier );

		const category = tier !== 'all' && ! this.props.category ? '' : this.props.category;
		const showCollection =
			this.isThemeDiscoveryEnabled() && ! this.props.filterString && ! category && tier !== 'all';

		const url = this.constructUrl( {
			tier,
			category,
			search: showCollection ? '' : this.props.search,
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
		} else {
			const subjectTerm = filterToTermTable[ `subject:${ tabFilter.key }` ];
			newUrlParams.filter = [ filterWithoutSubjects, subjectTerm ].join( '+' );
			newUrlParams.category = null;
		}

		page( this.constructUrl( newUrlParams ) );

		this.scrollToSearchInput();
	};

	onDesignYourOwnClick = () => {
		const { isLoggedIn, site: selectedSite, siteEditorUrl } = this.props;
		const shouldGoToAssemblerStep = isAssemblerSupported();
		recordTracksEvent( 'calypso_themeshowcase_pattern_assembler_top_button_click', {
			is_logged_in: isLoggedIn,
		} );

		const destinationUrl = getSiteAssemblerUrl( {
			isLoggedIn,
			selectedSite,
			shouldGoToAssemblerStep,
			siteEditorUrl,
		} );

		window.location.assign( destinationUrl );
	};

	shouldShowCollections = () => {
		const { category, search, filter, isCollectionView, tier } = this.props;

		if ( this.props.isJetpackSite && ! this.props.isAtomicSite ) {
			return false;
		}

		return (
			! ( category || search || filter || isCollectionView ) &&
			tier === '' &&
			this.isThemeDiscoveryEnabled()
		);
	};

	allThemes = ( { themeProps } ) => {
		const { filter, isCollectionView, tier } = this.props;

		// In Collection View of pricing tiers (e.g. Partner themes), prevent requesting only recommended themes.
		const themesSelectionProps = {
			...themeProps,
			...( isCollectionView && tier && ! filter && { tabFilter: '' } ),
		};

		const themeCollection = THEME_COLLECTIONS.partner;

		return (
			<div className="theme-showcase__all-themes">
				<ThemesSelection { ...themesSelectionProps }>
					{ this.shouldShowCollections() && (
						<>
							<ShowcaseThemeCollection
								{ ...themeCollection }
								getOptions={ this.getThemeOptions }
								getScreenshotUrl={ this.getScreenshotUrl }
								getActionLabel={ this.getActionLabel }
								onSeeAll={ () =>
									this.onCollectionSeeAll( {
										tier: themeCollection.query.tier,
										filter: themeCollection.query.filter,
									} )
								}
							/>
						</>
					) }
				</ThemesSelection>
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

		switch ( tabKey ) {
			case staticFilters.MYTHEMES?.key:
				return <ThemesSelection { ...themeProps } />;
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
			isSiteECommerceFreeTrial,
			isSiteWooExpressOrEcomFreeTrial,
			isSiteWooExpress,
			isCollectionView,
			lastNonEditorRoute,
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
			source: this.props.category !== staticFilters.MYTHEMES.key ? 'wpcom' : null,
		};

		const tabFilters = this.getTabFilters();
		const tiers = this.getTiers();

		const classnames = classNames( 'theme-showcase', {
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
					onPatternAssemblerButtonClick={ this.onDesignYourOwnClick }
					isSiteWooExpressOrEcomFreeTrial={ isSiteWooExpressOrEcomFreeTrial }
					isSiteECommerceFreeTrial={ isSiteECommerceFreeTrial }
				/>
				{ isLoggedIn && (
					<ThemeShowcaseSurvey
						survey={ SurveyType.FEBRUARY_2024 }
						condition={ () => lastNonEditorRoute.includes( 'theme/' ) }
					/>
				) }
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
									<>
										<SelectDropdown
											className="section-nav-tabs__dropdown"
											onSelect={ this.onTierSelectFilter }
											selectedText={ translate( 'View: %s', {
												args: getOptionLabel( tiers, tier ) || '',
											} ) }
											options={ tiers }
											initialSelected={ tier }
										></SelectDropdown>
									</>
								) }
							</div>
							<div
								className={ classNames( 'themes__filters', {
									'is-woo-express': isSiteWooExpress,
								} ) }
							>
								{ tabFilters && ! isSiteECommerceFreeTrial && (
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
								{ ! isLoggedIn && tabFilters && (
									<PatternAssemblerButton onClick={ this.onDesignYourOwnClick } />
								) }
							</div>
						</div>
					) }
					{ isCollectionView && (
						<ThemeCollectionViewHeader
							backUrl={ this.constructUrl( {
								isCollectionView: false,
								tier: '',
								filter: '',
								search: '',
								category: this.getDefaultStaticFilter().key,
							} ) }
							filter={ this.props.filter }
							tier={ this.props.tier }
							isLoggedIn={ isLoggedIn }
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
		site: getSite( state, siteId ),
		siteCanInstallThemes: siteHasFeature( state, siteId, FEATURE_INSTALL_THEMES ),
		siteEditorUrl: getSiteEditorUrl( state, siteId ),
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
		lastNonEditorRoute: getLastNonEditorRoute( state ),
		themeTiers: getThemeTiers( state ),
	};
};

export default connect( mapStateToProps, { setBackPath } )( localize( ThemeShowcase ) );
