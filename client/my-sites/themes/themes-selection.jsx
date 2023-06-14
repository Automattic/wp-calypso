import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { compact, property, snakeCase } from 'lodash';
import { default as pageRouter } from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import * as React from 'react';
import { connect } from 'react-redux';
import QueryThemes from 'calypso/components/data/query-themes';
import ThemesList from 'calypso/components/themes-list';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { setThemePreviewOptions } from 'calypso/state/themes/actions';
import {
	arePremiumThemesEnabled,
	getPremiumThemePrice,
	getThemeDetailsUrl,
	getThemesForQueryIgnoringPage,
	isRequestingThemesForQuery,
	isThemesLastPageForQuery,
	isThemeActive,
	isInstallingTheme,
	prependThemeFilterKeys,
} from 'calypso/state/themes/selectors';
import { addStyleVariation, trackClick, interlaceThemes } from './helpers';
import SearchThemesTracks from './search-themes-tracks';
import './themes-selection.scss';

class ThemesSelection extends Component {
	static propTypes = {
		emptyContent: PropTypes.element,
		getOptions: PropTypes.func,
		getActionLabel: PropTypes.func,
		incrementPage: PropTypes.func,
		listLabel: PropTypes.string,
		onScreenshotClick: PropTypes.func,
		query: PropTypes.object.isRequired,
		siteId: PropTypes.number,
		// connected props
		bookmarkRef: PropTypes.oneOfType( [
			PropTypes.func,
			PropTypes.shape( { current: PropTypes.any } ),
		] ),
		getPremiumThemePrice: PropTypes.func,
		getThemeDetailsUrl: PropTypes.func,
		isInstallingTheme: PropTypes.func,
		isLastPage: PropTypes.bool,
		isRequesting: PropTypes.bool,
		isThemeActive: PropTypes.func,
		placeholderCount: PropTypes.number,
		source: PropTypes.oneOfType( [ PropTypes.number, PropTypes.oneOf( [ 'wpcom', 'wporg' ] ) ] ),
		themes: PropTypes.array,
		forceWpOrgSearch: PropTypes.bool,
	};

	static defaultProps = {
		emptyContent: null,
		showUploadButton: true,
		forceWpOrgSearch: false,
	};

	componentDidMount() {
		// Create "buffer zone" to prevent overscrolling too early bugging pagination requests.
		const { query } = this.props;
		if ( ! query.search && ! query.filter && ! query.tier ) {
			this.props.incrementPage();
		}
	}

	recordSearchResultsClick = ( themeId, resultsRank, action, variation = '@theme' ) => {
		const { query, filterString, themes } = this.props;
		const search_taxonomies = filterString;
		const search_term = search_taxonomies + ( query.search || '' );

		this.props.recordTracksEvent( 'calypso_themeshowcase_theme_click', {
			search_term: search_term || null,
			search_taxonomies,
			theme: themeId,
			style_variation: variation,
			results_rank: resultsRank + 1,
			results: themes.map( property( 'id' ) ).join(),
			page_number: query.page,
			theme_on_page: parseInt( ( resultsRank + 1 ) / query.number ),
			action: snakeCase( action ),
		} );
	};

	trackScrollPage() {
		this.props.recordTracksEvent( 'calypso_themeshowcase_scroll' );
		this.props.trackScrollPage();
	}

	trackLastPage() {
		this.props.recordGoogleEvent( 'Themes', 'Reached Last Page' );
		this.props.recordTracksEvent( 'calypso_themeshowcase_last_page_scroll' );
	}

	onScreenshotClick = ( themeId, resultsRank ) => {
		trackClick( 'theme', 'screenshot' );
		if ( ! this.props.isThemeActive( themeId ) ) {
			this.recordSearchResultsClick( themeId, resultsRank, 'screenshot_info' );
		}
		this.props.onScreenshotClick && this.props.onScreenshotClick( themeId );
	};

	onStyleVariationClick = ( themeId, resultsRank, variation ) => {
		const { query, filterString } = this.props;
		const search_taxonomies = filterString;
		const search_term = search_taxonomies + ( query.search || '' );
		if ( ! this.props.isThemeActive( themeId ) ) {
			this.recordSearchResultsClick( themeId, resultsRank, 'style_variation', variation?.slug );
		}

		const tracksProps = {
			search_term: search_term || null,
			search_taxonomies,
			theme: themeId,
			results_rank: resultsRank + 1,
			page_number: query.page,
			theme_on_page: parseInt( ( resultsRank + 1 ) / query.number ),
		};

		if ( variation ) {
			this.props.recordTracksEvent( 'calypso_themeshowcase_theme_style_variation_click', {
				...tracksProps,
				style_variation: variation.slug,
			} );
		} else {
			this.props.recordTracksEvent(
				'calypso_themeshowcase_theme_style_variation_more_click',
				tracksProps
			);

			pageRouter( this.props.getThemeDetailsUrl( themeId ) );
		}
	};

	onMoreButtonItemClick = ( themeId, resultsRank, key ) => {
		const { query, filterString } = this.props;
		const search_taxonomies = filterString;
		const search_term = search_taxonomies + ( query.search || '' );

		this.props.recordTracksEvent( 'calypso_themeshowcase_theme_more_button_item_click', {
			search_term: search_term || null,
			search_taxonomies,
			theme: themeId,
			action: key,
			results_rank: resultsRank + 1,
			page_number: query.page,
			theme_on_page: parseInt( ( resultsRank + 1 ) / query.number ),
		} );
	};

	fetchNextPage = ( options ) => {
		if ( this.props.isRequesting || this.props.isLastPage ) {
			return;
		}

		if ( options.triggeredByScroll ) {
			this.trackScrollPage();
		}

		this.props.incrementPage();
	};

	//intercept preview and add primary and secondary
	getOptions = ( themeId, styleVariation, context ) => {
		let options = this.props.getOptions( themeId, styleVariation );
		const wrappedPreviewAction = ( action ) => {
			let defaultOption;
			let secondaryOption = this.props.secondaryOption;

			if ( secondaryOption?.hideForTheme( themeId, this.props.siteId ) ) {
				secondaryOption = null;
			}

			return ( t ) => {
				if ( ! this.props.isLoggedIn ) {
					defaultOption = options.signup;
					secondaryOption = null;
				} else if ( this.props.isThemeActive( themeId ) ) {
					defaultOption = options.customize;
				} else if ( options.upgradePlanForExternallyManagedThemes ) {
					defaultOption = options.upgradePlanForExternallyManagedThemes;
					secondaryOption = null;
				} else if ( options.upgradePlanForBundledThemes ) {
					defaultOption = options.upgradePlanForBundledThemes;
					secondaryOption = null;
				} else if ( options.purchase ) {
					defaultOption = options.purchase;
				} else if ( options.upgradePlan ) {
					defaultOption = options.upgradePlan;
					secondaryOption = null;
				} else {
					defaultOption = options.activate;
				}
				this.props.setThemePreviewOptions(
					themeId,
					defaultOption,
					secondaryOption,
					styleVariation
				);
				return action( t, context );
			};
		};

		if ( options ) {
			options = addStyleVariation( options, styleVariation, this.props.isLoggedIn );
			if ( options.preview ) {
				options.preview.action = wrappedPreviewAction( options.preview.action );
			}
		}

		return options;
	};

	render() {
		const {
			themes,
			source,
			query,
			upsellUrl,
			upsellBanner,
			siteId,
			tabFilter,
			isLastPage,
			includeWpOrgThemes,
			wpOrgQuery,
			wpOrgThemes,
		} = this.props;

		const interlacedThemes = interlaceThemes( themes, wpOrgThemes, query.search, isLastPage );

		return (
			<div className="themes__selection">
				<QueryThemes query={ query } siteId={ source } />
				{ includeWpOrgThemes && <QueryThemes query={ wpOrgQuery } siteId="wporg" /> }
				<ThemesList
					upsellUrl={ upsellUrl }
					upsellBanner={ upsellBanner }
					themes={ interlacedThemes }
					fetchNextPage={ this.fetchNextPage }
					recordTracksEvent={ this.props.recordTracksEvent }
					onMoreButtonClick={ this.recordSearchResultsClick }
					onMoreButtonItemClick={ this.onMoreButtonItemClick }
					getButtonOptions={ this.getOptions }
					onScreenshotClick={ this.onScreenshotClick }
					onStyleVariationClick={ this.onStyleVariationClick }
					getScreenshotUrl={ this.props.getScreenshotUrl }
					getActionLabel={ this.props.getActionLabel }
					isActive={ this.props.isThemeActive }
					getPrice={ this.props.getPremiumThemePrice }
					isInstalling={ this.props.isInstallingTheme }
					loading={ this.props.isRequesting }
					emptyContent={ this.props.emptyContent }
					placeholderCount={ this.props.placeholderCount }
					bookmarkRef={ this.props.bookmarkRef }
					siteId={ siteId }
					searchTerm={ query.search }
					tabFilter={ tabFilter }
				/>
				<SearchThemesTracks query={ query } themes={ interlacedThemes } />
			</div>
		);
	}
}

function bindIsThemeActive( state, siteId ) {
	return ( themeId ) => isThemeActive( state, themeId, siteId );
}

function bindIsInstallingTheme( state, siteId ) {
	return ( themeId ) => isInstallingTheme( state, themeId, siteId );
}

function bindGetPremiumThemePrice( state, siteId ) {
	return ( themeId ) => getPremiumThemePrice( state, themeId, siteId );
}

function bindGetThemeDetailsUrl( state, siteId ) {
	return ( themeId ) => getThemeDetailsUrl( state, themeId, siteId );
}

// Exporting this for use in customized themes lists (recommended-themes.jsx, etc.)
// We do not want pagination triggered in that use of the component.
export const ConnectedThemesSelection = connect(
	(
		state,
		{
			filter,
			page,
			search,
			tier,
			vertical,
			siteId,
			source,
			forceWpOrgSearch,
			isLoading: isCustomizedThemeListLoading,
		}
	) => {
		const isJetpack = isJetpackSite( state, siteId );
		const isAtomic = isSiteAutomatedTransfer( state, siteId );
		const premiumThemesEnabled = arePremiumThemesEnabled( state, siteId );
		const hasUnlimitedPremiumThemes = siteHasFeature(
			state,
			siteId,
			WPCOM_FEATURES_PREMIUM_THEMES
		);

		let sourceSiteId;
		if ( source === 'wpcom' || source === 'wporg' ) {
			sourceSiteId = source;
		} else {
			sourceSiteId = siteId && isJetpack ? siteId : 'wpcom';
		}

		if ( isAtomic && ! hasUnlimitedPremiumThemes ) {
			sourceSiteId = 'wpcom';
		}

		// number calculation is just a hack for Jetpack sites. Jetpack themes endpoint does not paginate the
		// results and sends all of the themes at once. QueryManager is not expecting such behaviour
		// and we ended up loosing all of the themes above number 20. Real solution will be pagination on
		// Jetpack themes endpoint.
		const number = ! [ 'wpcom', 'wporg' ].includes( sourceSiteId ) ? 2000 : 100;
		const query = {
			search,
			page,
			tier: premiumThemesEnabled ? tier : 'free',
			filter: compact( [ filter, vertical ] ).join( ',' ),
			number,
		};

		const themes = getThemesForQueryIgnoringPage( state, sourceSiteId, query ) || [];

		const includeWpOrgThemes = forceWpOrgSearch && sourceSiteId !== 'wporg' && search; // Only display WP.org themes when searching a term.
		const wpOrgQuery = { ...query, page: 1 }; // We limit the WP.org themes to one page only.
		const wpOrgThemes = includeWpOrgThemes
			? getThemesForQueryIgnoringPage( state, 'wporg', wpOrgQuery ) || []
			: [];

		return {
			query,
			source: sourceSiteId,
			siteId: siteId,
			siteSlug: getSiteSlug( state, siteId ),
			themes,
			isRequesting:
				isCustomizedThemeListLoading ||
				isRequestingThemesForQuery( state, sourceSiteId, query ) ||
				( includeWpOrgThemes && isRequestingThemesForQuery( state, 'wporg', wpOrgQuery ) ),
			isLastPage: isThemesLastPageForQuery( state, sourceSiteId, query ),
			isLoggedIn: isUserLoggedIn( state ),
			isThemeActive: bindIsThemeActive( state, siteId ),
			isInstallingTheme: bindIsInstallingTheme( state, siteId ),
			// Note: This component assumes that purchase and plans data is already present in the state tree
			// (used by the `isPremiumThemeAvailable` selector). That data is provided by the `<QuerySitePurchases />`
			// and `<QuerySitePlans />` components, respectively. At the time of implementation, neither of them
			// provides caching, and both are already being rendered by a parent component. So to avoid
			// redundant AJAX requests, we're not rendering these query components locally.
			getPremiumThemePrice: bindGetPremiumThemePrice( state, siteId ),
			getThemeDetailsUrl: bindGetThemeDetailsUrl( state, siteId ),
			filterString: prependThemeFilterKeys( state, query.filter ),
			includeWpOrgThemes,
			wpOrgQuery,
			wpOrgThemes,
		};
	},
	{ setThemePreviewOptions, recordGoogleEvent, recordTracksEvent }
)( ThemesSelection );

/**
 * Provide page state management needed for `ThemesSelection`. We cannot store the
 * current state inside `ThemesSelection` since it is also needed in its `connect`
 * call for selectors that require the entire query object, including the page.
 */
class ThemesSelectionWithPage extends React.Component {
	state = {
		page: 1,
	};

	componentDidUpdate( nextProps ) {
		if (
			nextProps.siteId !== this.props.siteId ||
			nextProps.search !== this.props.search ||
			nextProps.tier !== this.props.tier ||
			nextProps.filter !== this.props.filter ||
			nextProps.vertical !== this.props.vertical
		) {
			this.resetPage();
		}
	}

	incrementPage = () => {
		this.setState( ( prevState ) => ( { page: prevState.page + 1 } ) );
	};

	resetPage = () => {
		this.setState( { page: 1 } );
	};

	render() {
		return (
			<ConnectedThemesSelection
				{ ...this.props }
				page={ this.state.page }
				incrementPage={ this.incrementPage }
			/>
		);
	}
}

export default ThemesSelectionWithPage;
