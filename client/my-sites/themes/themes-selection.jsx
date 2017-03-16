/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compact, includes, isEqual, omit, property, snakeCase } from 'lodash';

/**
 * Internal dependencies
 */
import { trackClick } from './helpers';
import QueryThemes from 'components/data/query-themes';
import ThemesList from 'components/themes-list';
import ThemesSelectionHeader from './themes-selection-header';
import analytics from 'lib/analytics';
import { isJetpackSite } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import {
	getThemesForQueryIgnoringPage,
	getThemesFoundForQuery,
	isRequestingThemesForQuery,
	isThemesLastPageForQuery,
	isPremiumThemeAvailable,
	isThemeActive,
	isInstallingTheme
} from 'state/themes/selectors';
import { setThemePreviewOptions } from 'state/themes/actions';
import config from 'config';
import { PAGINATION_QUERY_KEYS } from 'lib/query-manager/paginated/constants';

const ThemesSelection = React.createClass( {
	propTypes: {
		emptyContent: PropTypes.element,
		query: PropTypes.object.isRequired,
		siteId: PropTypes.number,
		onScreenshotClick: PropTypes.func,
		getOptions: PropTypes.func,
		getActionLabel: PropTypes.func,
		incrementPage: PropTypes.func,
		resetPage: PropTypes.func,
		// connected props
		source: PropTypes.oneOfType( [
			PropTypes.number,
			PropTypes.oneOf( [ 'wpcom', 'wporg' ] )
		] ),
		themes: PropTypes.array,
		themesCount: PropTypes.number,
		isRequesting: PropTypes.bool,
		isLastPage: PropTypes.bool,
		isThemeActive: PropTypes.func,
		isThemePurchased: PropTypes.func,
		isInstallingTheme: PropTypes.func,
		placeholderCount: PropTypes.number
	},

	getDefaultProps() {
		return {
			emptyContent: null,
			showUploadButton: true
		};
	},

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( omit( this.props.query, PAGINATION_QUERY_KEYS ), omit( nextProps.query, PAGINATION_QUERY_KEYS ) ) ) {
			this.props.resetPage();
		}
	},

	recordSearchResultsClick( theme, resultsRank, action ) {
		const { query, themes } = this.props;
		analytics.tracks.recordEvent( 'calypso_themeshowcase_theme_click', {
			search_term: query.search,
			theme: theme.id,
			results_rank: resultsRank + 1,
			results: themes.map( property( 'id' ) ).join(),
			page_number: query.page,
			theme_on_page: parseInt( ( resultsRank + 1 ) / query.number ),
			action: snakeCase( action )
		} );
	},

	trackScrollPage() {
		analytics.tracks.recordEvent( 'calypso_themeshowcase_scroll' );
		this.props.trackScrollPage();
	},

	trackLastPage() {
		analytics.ga.recordEvent( 'Themes', 'Reached Last Page' );
		analytics.tracks.recordEvent( 'calypso_themeshowcase_last_page_scroll' );
	},

	onScreenshotClick( theme, resultsRank ) {
		trackClick( 'theme', 'screenshot' );
		if ( ! this.props.isThemeActive( theme ) ) {
			this.recordSearchResultsClick( theme, resultsRank, 'screenshot_info' );
		}
		this.props.onScreenshotClick && this.props.onScreenshotClick( theme );
	},

	fetchNextPage( options ) {
		if ( this.props.isRequesting || this.props.isLastPage ) {
			return;
		}

		if ( options.triggeredByScroll ) {
			this.trackScrollPage();
		}

		this.props.incrementPage();
	},

	//intercept preview and add primary and secondary
	getOptions( themeId ) {
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
	},

	render() {
		const { source, query, listLabel, themesCount } = this.props;

		return (
			<div className="themes__selection">
				<QueryThemes
					query={ query }
					siteId={ source } />
				<ThemesSelectionHeader
					label={ listLabel }
					count={ themesCount }
				/>
				<ThemesList themes={ this.props.themes }
					fetchNextPage={ this.fetchNextPage }
					onMoreButtonClick={ this.recordSearchResultsClick }
					getButtonOptions={ this.getOptions }
					onScreenshotClick={ this.onScreenshotClick }
					getScreenshotUrl={ this.props.getScreenshotUrl }
					getActionLabel={ this.props.getActionLabel }
					isActive={ this.props.isThemeActive }
					isPurchased={ this.props.isThemePurchased }
					isInstalling={ this.props.isInstallingTheme }
					loading={ this.props.isRequesting }
					emptyContent={ this.props.emptyContent }
					placeholderCount={ this.props.placeholderCount } />
			</div>
		);
	},

} );

const ConnectedThemesSelection = connect(
	( state, { filter, page, search, tier, vertical, siteId, source } ) => {
		const isJetpack = isJetpackSite( state, siteId );
		let sourceSiteId;
		if ( source === 'wpcom' || source === 'wporg' ) {
			sourceSiteId = source;
		} else {
			sourceSiteId = ( siteId && isJetpack ) ? siteId : 'wpcom';
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
			number
		};

		return {
			query,
			source: sourceSiteId,
			siteSlug: getSiteSlug( state, siteId ),
			themes: getThemesForQueryIgnoringPage( state, sourceSiteId, query ) || [],
			themesCount: getThemesFoundForQuery( state, sourceSiteId, query ),
			isRequesting: isRequestingThemesForQuery( state, sourceSiteId, query ),
			isLastPage: isThemesLastPageForQuery( state, sourceSiteId, query ),
			isLoggedIn: !! getCurrentUserId( state ),
			isThemeActive: themeId => isThemeActive( state, themeId, siteId ),
			isInstallingTheme: themeId => isInstallingTheme( state, themeId, siteId ),
			// Note: This component assumes that purchase and plans data is already present in the state tree
			// (used by the `isPremiumThemeAvailable` selector). That data is provided by the `<QuerySitePurchases />`
			// and `<QuerySitePlans />` components, respectively. At the time of implementation, neither of them
			// provides caching, and both are already being rendered by a parent component. So to avoid
			// redundant AJAX requests, we're not rendering these query components locally.
			isThemePurchased: themeId => isPremiumThemeAvailable( state, themeId, siteId )
		};
	},
	{ setThemePreviewOptions }
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

	incrementPage = () => {
		this.setState( { page: this.state.page + 1 } );
	}

	resetPage = () => {
		this.setState( { page: 1 } );
	}

	render() {
		return (
			<ConnectedThemesSelection { ...this.props }
				page={ this.state.page }
				incrementPage={ this.incrementPage }
				resetPage={ this.resetPage }
			/>
		);
	}
}

export default ThemesSelectionWithPage;
