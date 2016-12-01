/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import compact from 'lodash/compact';

/**
 * Internal dependencies
 */
import { trackClick } from './helpers';
import ThemesData from 'components/data/themes-list-fetcher';
import ThemesList from 'components/themes-list';
import analytics from 'lib/analytics';
import { hasFeature } from 'state/sites/plans/selectors';
import { isThemeActive } from 'state/themes/selectors';
import { isThemePurchased } from 'state/themes/selectors';
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
		getOptions: React.PropTypes.func,
		getActionLabel: React.PropTypes.func,
		tier: React.PropTypes.string,
		filter: React.PropTypes.string,
		vertical: React.PropTypes.string,
		// connected props
		siteSlug: React.PropTypes.string,
		isThemeActive: React.PropTypes.func,
		isThemePurchased: React.PropTypes.func,
	},

	getDefaultProps() {
		return { search: '' };
	},

	onMoreButtonClick( theme, resultsRank ) {
		this.recordSearchResultsClick( theme, resultsRank );
	},

	recordSearchResultsClick( theme, resultsRank ) {
		const { queryParams, themesList } = this.props;
		analytics.tracks.recordEvent( 'calypso_themeshowcase_theme_click', {
			search_term: queryParams.search,
			theme: theme,
			results_rank: resultsRank + 1,
			results: themesList,
			page_number: queryParams.page
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

	addVerticalToFilters() {
		const { vertical, filter } = this.props;
		return compact( [ filter, vertical ] ).join( ',' );
	},

	render() {
		const { selectedSite: site } = this.props;

		return (
			<div className="themes__selection">
				<ThemesData
					site={ site }
					isMultisite={ ! this.props.siteId } // Not the same as `! site` !
					search={ this.props.search }
					tier={ this.props.tier }
					filter={ this.addVerticalToFilters() }
					onRealScroll={ this.trackScrollPage }
					onLastPage={ this.trackLastPage } >
					<ThemesList getButtonOptions={ this.props.getOptions }
						onMoreButtonClick={ this.onMoreButtonClick }
						onScreenshotClick={ this.onScreenshotClick }
						getScreenshotUrl={ this.props.getScreenshotUrl }
						getActionLabel={ this.props.getActionLabel }
						isActive={ this.props.isThemeActive }
						isPurchased={ this.props.isThemePurchased } />
				</ThemesData>
			</div>
		);
	},

} );

export default connect(
	( state, { siteId } ) => ( {
		siteSlug: getSiteSlug( state, siteId ),
		isThemeActive: themeId => isThemeActive( state, themeId, siteId ),
		isThemePurchased: themeId => (
			// Note: This component assumes that purchase and data is already present in the state tree
			// (used by the isThemePurchased selector). At the time of implementation there's no caching
			// in <QuerySitePurchases /> and a parent component is already rendering it. So to avoid
			// redundant AJAX requests, we're not rendering the query component locally.
			isThemePurchased( state, themeId, siteId ) ||
			// The same is true for the `hasFeature` selector, which relies on the presence of
			// a `<QuerySitePlans />` component in a parent component.
			hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES )
		),
		queryParams: getQueryParams( state ),
		themesList: getThemesList( state ),
	} )
)( ThemesSelection );
