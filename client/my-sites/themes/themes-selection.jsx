/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { trackClick } from './helpers';
import QueryThemes from 'components/data/query-themes';
import ThemesList from 'components/themes-list';
import analytics from 'lib/analytics';
import { isJetpackSite } from 'state/sites/selectors';
import { hasFeature } from 'state/sites/plans/selectors';
import {
	getThemesForQueryIgnoringPage,
	isRequestingThemesForQuery,
	isRequestingThemesForQueryIgnoringPage,
	isThemesLastPageForQuery,
	isThemeActive,
	isThemePurchased
} from 'state/themes/selectors';
import { FEATURE_UNLIMITED_PREMIUM_THEMES } from 'lib/plans/constants';

const ThemesSelection = React.createClass( {
	propTypes: {
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ).isRequired,
		siteId: PropTypes.number,
		search: PropTypes.string,
		onScreenshotClick: PropTypes.func,
		getOptions: PropTypes.func,
		query: PropTypes.object.isRequired,
		getActionLabel: PropTypes.func,
		// connected props
		siteIdOrWpcom: PropTypes.oneOfType( [
			PropTypes.number,
			PropTypes.oneOf( [ 'wpcom' ] )
		] ),
		themes: PropTypes.array,
		isRequesting: PropTypes.bool,
		isRequestingIgnoringQuery: PropTypes.bool,
		isLastPage: PropTypes.bool,
		isActiveTheme: PropTypes.func,
		isThemePurchased: PropTypes.func,
	},

	getDefaultProps() {
		return { search: '' };
	},

	onMoreButtonClick( theme, resultsRank ) {
		this.recordSearchResultsClick( theme, resultsRank );
	},

	recordSearchResultsClick( theme, resultsRank ) {
		const { query, themes } = this.props;
		analytics.tracks.recordEvent( 'calypso_themeshowcase_theme_click', {
			search_term: query.search,
			theme,
			results_rank: resultsRank + 1,
			results: themes,
			page_number: query.page
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
		if ( ! this.props.isThemeActive( theme.id ) ) {
			this.recordSearchResultsClick( theme, resultsRank );
		}
		this.props.onScreenshotClick && this.props.onScreenshotClick( theme );
	},

	fetchNextPage( options ) {
		if ( this.props.isRequesting || /* this.props.isRequestingIgnoringQuery || */ this.props.isLastPage ) {
			return;
		}

		if ( options.triggeredByScroll ) {
			this.trackScrollPage();
		}

		this.props.incrementPage();
	},

	render() {
		const { siteIdOrWpcom, query } = this.props;

		return (
			<div className="themes__selection">
				<QueryThemes
					query={ query }
					siteId={ siteIdOrWpcom } />
				<ThemesList themes={ this.props.themes }
					fetchNextPage={ this.fetchNextPage }
					getButtonOptions={ this.props.getOptions }
					onMoreButtonClick={ this.onMoreButtonClick }
					onScreenshotClick={ this.onScreenshotClick }
					getScreenshotUrl={ this.props.getScreenshotUrl }
					getActionLabel={ this.props.getActionLabel }
					isActive={ this.props.isActiveTheme }
					isPurchased={ this.props.isThemePurchased } />
			</div>
		);
	},

} );

export default connect(
	( state, { query, siteId } ) => {
		const isJetpack = isJetpackSite( state, siteId );
		const siteIdOrWpcom = ( siteId && isJetpack ) ? siteId : 'wpcom';
		return {
			siteIdOrWpcom,
			themes: getThemesForQueryIgnoringPage( state, siteIdOrWpcom, query ) || [],
			isRequesting: isRequestingThemesForQuery( state, siteIdOrWpcom, query ),
			isRequestingIgnoringQuery: isRequestingThemesForQueryIgnoringPage( state, siteIdOrWpcom, query ),
			isLastPage: isThemesLastPageForQuery( state, siteIdOrWpcom, query ),
			isActiveTheme: themeId => isThemeActive( state, themeId, siteId ),
			isThemePurchased: themeId => (
				// Note: This component assumes that purchase and data is already present in the state tree
				// (used by the isThemePurchased selector). At the time of implementation there's no caching
				// in <QuerySitePurchases /> and a parent component is already rendering it. So to avoid
				// redundant AJAX requests, we're not rendering the query component locally.
				isThemePurchased( state, themeId, siteId ) ||
				// The same is true for the `hasFeature` selector, which relies on the presence of
				// a `<QuerySitePlans />` component in a parent component.
				hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES )
			)
		};
	}
)( ThemesSelection );
