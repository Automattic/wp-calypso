/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compact, includes, isEqual, property, snakeCase } from 'lodash';

/**
 * Internal dependencies
 */
import { trackClick } from './helpers';
import QueryThemes from 'components/data/query-themes';
import ThemesList from 'components/themes-list';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import {
	getPremiumThemePrice,
	getThemesForQueryIgnoringPage,
	getThemesFoundForQuery,
	isRequestingThemesForQuery,
	isThemesLastPageForQuery,
	isThemeActive,
	isInstallingTheme,
	prependThemeFilterKeys,
} from 'state/themes/selectors';
import { setThemePreviewOptions } from 'state/themes/actions';
import config from 'config';

/**
 * Style dependencies
 */
import './themes-selection.scss';

class ThemesSelection extends Component {
	static propTypes = {
		emptyContent: PropTypes.element,
		query: PropTypes.object.isRequired,
		siteId: PropTypes.number,
		onScreenshotClick: PropTypes.func,
		getOptions: PropTypes.func,
		getActionLabel: PropTypes.func,
		incrementPage: PropTypes.func,
		// connected props
		source: PropTypes.oneOfType( [ PropTypes.number, PropTypes.oneOf( [ 'wpcom', 'wporg' ] ) ] ),
		themes: PropTypes.array,
		recommendedThemes: PropTypes.array,
		themesCount: PropTypes.number,
		isRequesting: PropTypes.bool,
		isLastPage: PropTypes.bool,
		isThemeActive: PropTypes.func,
		getPremiumThemePrice: PropTypes.func,
		isInstallingTheme: PropTypes.func,
		placeholderCount: PropTypes.number,
		bookmarkRef: PropTypes.oneOfType( [
			PropTypes.func,
			PropTypes.shape( { current: PropTypes.any } ),
		] ),
	};

	static defaultProps = {
		emptyContent: null,
		showUploadButton: true,
	};

	componentDidMount() {
		// Create "buffer zone" to prevent overscrolling too early bugging pagination requests.
		const { query, recommendedThemes } = this.props;
		if ( ! recommendedThemes && ! query.search && ! query.filter && ! query.tier ) {
			this.props.incrementPage();
		}
	}

	recordSearchResultsClick = ( themeId, resultsRank, action ) => {
		// TODO do we need different query if from RecommendedThemes?
		const { query, filterString } = this.props;
		const themes = this.props.recommendedThemes || this.props.themes;
		const search_taxonomies = filterString;
		const search_term = search_taxonomies + ( query.search || '' );

		this.props.recordTracksEvent( 'calypso_themeshowcase_theme_click', {
			search_term: search_term || null,
			search_taxonomies,
			theme: themeId,
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

	fetchNextPage = ( options ) => {
		if ( this.props.isRequesting || this.props.isLastPage ) {
			return;
		}

		if ( options.triggeredByScroll ) {
			this.trackScrollPage();
		}

		if ( ! this.props.recommendedThemes ) {
			this.props.incrementPage();
		}
	};

	//intercept preview and add primary and secondary
	getOptions = ( themeId ) => {
		const options = this.props.getOptions( themeId );
		const wrappedPreviewAction = ( action ) => {
			let defaultOption;
			let secondaryOption = this.props.secondaryOption;
			return ( t ) => {
				if ( ! this.props.isLoggedIn ) {
					defaultOption = options.signup;
					secondaryOption = null;
				} else if ( this.props.isThemeActive( themeId ) ) {
					defaultOption = options.customize;
				} else if ( options.purchase ) {
					defaultOption = options.purchase;
				} else if ( options.upgradePlan ) {
					defaultOption = options.upgradePlan;
					secondaryOption = null;
				} else {
					defaultOption = options.activate;
				}
				this.props.setThemePreviewOptions( defaultOption, secondaryOption );
				return action( t );
			};
		};

		if ( options && options.preview ) {
			options.preview.action = wrappedPreviewAction( options.preview.action );
		}

		return options;
	};

	render() {
		const { source, query, upsellUrl } = this.props;

		return (
			<div className="themes__selection">
				<QueryThemes query={ query } siteId={ source } />
				<ThemesList
					upsellUrl={ upsellUrl }
					themes={ this.props.recommendedThemes || this.props.themes }
					fetchNextPage={ this.fetchNextPage }
					onMoreButtonClick={ this.recordSearchResultsClick }
					getButtonOptions={ this.getOptions }
					onScreenshotClick={ this.onScreenshotClick }
					getScreenshotUrl={ this.props.getScreenshotUrl }
					getActionLabel={ this.props.getActionLabel }
					isActive={ this.props.isThemeActive }
					getPrice={ this.props.getPremiumThemePrice }
					isInstalling={ this.props.isInstallingTheme }
					loading={ this.props.isRequesting }
					emptyContent={ this.props.emptyContent }
					placeholderCount={ this.props.placeholderCount }
					bookmarkRef={ this.props.bookmarkRef }
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
	( themeId ) => getPremiumThemePrice( state, themeId, siteId );
}

// Exporting this for use in recommended-themes.jsx
// We do not want pagination triggered in that use of the component.
export const ConnectedThemesSelection = connect(
	( state, { filter, page, search, tier, vertical, siteId, source } ) => {
		const isJetpack = isJetpackSite( state, siteId );
		let sourceSiteId;
		if ( source === 'wpcom' || source === 'wporg' ) {
			sourceSiteId = source;
		} else {
			sourceSiteId = siteId && isJetpack ? siteId : 'wpcom';
		}

		// number calculation is just a hack for Jetpack sites. Jetpack themes endpoint does not paginate the
		// results and sends all of the themes at once. QueryManager is not expecting such behaviour
		// and we ended up loosing all of the themes above number 20. Real solution will be pagination on
		// Jetpack themes endpoint.
		const number = ! includes( [ 'wpcom', 'wporg' ], sourceSiteId ) ? 2000 : 20;
		const query = {
			search,
			page,
			tier: config.isEnabled( 'upgrades/premium-themes' ) ? tier : 'free',
			filter: compact( [ filter, vertical ] ).join( ',' ),
			number,
		};

		return {
			query,
			source: sourceSiteId,
			siteSlug: getSiteSlug( state, siteId ),
			themes: getThemesForQueryIgnoringPage( state, sourceSiteId, query ) || [],
			themesCount: getThemesFoundForQuery( state, sourceSiteId, query ),
			isRequesting: isRequestingThemesForQuery( state, sourceSiteId, query ),
			isLastPage: isThemesLastPageForQuery( state, sourceSiteId, query ),
			isLoggedIn: !! getCurrentUserId( state ),
			isThemeActive: bindIsThemeActive( state, siteId ),
			isInstallingTheme: bindIsInstallingTheme( state, siteId ),
			// Note: This component assumes that purchase and plans data is already present in the state tree
			// (used by the `isPremiumThemeAvailable` selector). That data is provided by the `<QuerySitePurchases />`
			// and `<QuerySitePlans />` components, respectively. At the time of implementation, neither of them
			// provides caching, and both are already being rendered by a parent component. So to avoid
			// redundant AJAX requests, we're not rendering these query components locally.
			getPremiumThemePrice: bindGetPremiumThemePrice( state, siteId ),
			filterString: prependThemeFilterKeys( state, query.filter ),
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

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			nextProps.search !== this.props.search ||
			nextProps.tier !== this.props.tier ||
			! isEqual( nextProps.filter, this.props.filter ) ||
			! isEqual( nextProps.vertical, this.props.vertical )
		) {
			this.resetPage();
		}
	}

	incrementPage = () => {
		this.setState( { page: this.state.page + 1 } );
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
