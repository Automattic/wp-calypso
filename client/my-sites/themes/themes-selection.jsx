import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { compact, property, snakeCase } from 'lodash';
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
	getThemesForQueryIgnoringPage,
	getThemesFoundForQuery,
	isRequestingThemesForQuery,
	isThemesLastPageForQuery,
	isThemeActive,
	isInstallingTheme,
	prependThemeFilterKeys,
} from 'calypso/state/themes/selectors';
import { trackClick } from './helpers';
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
		isInstallingTheme: PropTypes.func,
		isLastPage: PropTypes.bool,
		isRequesting: PropTypes.bool,
		isThemeActive: PropTypes.func,
		placeholderCount: PropTypes.number,
		customizedThemesList: PropTypes.array,
		source: PropTypes.oneOfType( [ PropTypes.number, PropTypes.oneOf( [ 'wpcom', 'wporg' ] ) ] ),
		themes: PropTypes.array,
		themesCount: PropTypes.number,
		forceWpOrgSearch: PropTypes.bool,
	};

	static defaultProps = {
		emptyContent: null,
		showUploadButton: true,
		forceWpOrgSearch: false,
	};

	componentDidMount() {
		// Create "buffer zone" to prevent overscrolling too early bugging pagination requests.
		const { query, customizedThemesList } = this.props;
		if ( ! customizedThemesList && ! query.search && ! query.filter && ! query.tier ) {
			this.props.incrementPage();
		}
	}

	recordSearchResultsClick = ( themeId, resultsRank, action, variation = '@theme' ) => {
		const { query, filterString } = this.props;
		const themes = this.props.customizedThemesList || this.props.themes;
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
		if ( ! this.props.isThemeActive( themeId ) ) {
			this.recordSearchResultsClick( themeId, resultsRank, 'style_variation', variation?.slug );
		}

		const options = this.getOptions(
			themeId,
			variation,
			`style variation: ${ variation ? variation.slug : 'show more' }`
		);

		if ( options && options.preview ) {
			options.preview.action( themeId );
		}
	};

	fetchNextPage = ( options ) => {
		if ( this.props.isRequesting || this.props.isLastPage ) {
			return;
		}

		if ( options.triggeredByScroll ) {
			this.trackScrollPage();
		}

		if ( ! this.props.customizedThemesList ) {
			this.props.incrementPage();
		}
	};

	//intercept preview and add primary and secondary
	getOptions = ( themeId, styleVariation, context ) => {
		const options = this.props.getOptions( themeId );
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

		if ( options && options.preview ) {
			options.preview.action = wrappedPreviewAction( options.preview.action );
		}

		return options;
	};

	render() {
		const { source, query, upsellUrl, siteId } = this.props;

		const themes = this.props.customizedThemesList || this.props.themes;

		return (
			<div className="themes__selection">
				<QueryThemes query={ query } siteId={ source } />
				{ this.props.forceWpOrgSearch && source !== 'wporg' && (
					<QueryThemes query={ query } siteId="wporg" />
				) }
				<ThemesList
					upsellUrl={ upsellUrl }
					themes={ themes }
					wpOrgThemes={ this.props.wpOrgThemes }
					fetchNextPage={ this.fetchNextPage }
					recordTracksEvent={ this.props.recordTracksEvent }
					onMoreButtonClick={ this.recordSearchResultsClick }
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
				/>
				<SearchThemesTracks
					query={ query }
					themes={ themes }
					wporgThemes={ this.props.wpOrgThemes }
				/>
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
		const wpOrgThemes =
			forceWpOrgSearch && sourceSiteId !== 'wporg'
				? getThemesForQueryIgnoringPage( state, 'wporg', query ) || []
				: [];

		return {
			query,
			source: sourceSiteId,
			siteId: siteId,
			siteSlug: getSiteSlug( state, siteId ),
			themes,
			themesCount: getThemesFoundForQuery( state, sourceSiteId, query ),
			isRequesting:
				isCustomizedThemeListLoading || isRequestingThemesForQuery( state, sourceSiteId, query ),
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
			filterString: prependThemeFilterKeys( state, query.filter ),
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
