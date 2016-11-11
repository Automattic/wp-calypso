/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import page from 'page';
import compact from 'lodash/compact';

/**
 * Internal dependencies
 */
import { trackClick } from './helpers';
import ThemesData from 'components/data/themes-list-fetcher';
import ThemesList from 'components/themes-list';
import StickyPanel from 'components/sticky-panel';
import analytics from 'lib/analytics';
import buildUrl from 'lib/mixins/url-search/build-url';
import { getSiteSlug } from 'state/sites/selectors';
import { isActiveTheme } from 'state/themes/current-theme/selectors';
import { isThemePurchased } from 'state/themes/selectors';
import {
	getFilter,
	getSortedFilterTerms,
	stripFilters,
} from './theme-filters.js';
import config from 'config';

const ThemesSearchCard = config.isEnabled( 'manage/themes/magic-search' )
	? require( './themes-magic-search-card' )
	: require( './themes-search-card' );

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
		queryParams: PropTypes.object.isRequired,
		themesList: PropTypes.array.isRequired,
		getActionLabel: React.PropTypes.func,
		tier: React.PropTypes.string,
		filter: React.PropTypes.string,
		vertical: React.PropTypes.string,
		// connected props
		siteSlug: React.PropTypes.string,
		isActiveTheme: React.PropTypes.func,
		isThemePurchased: React.PropTypes.func,
	},

	getDefaultProps() {
		return { search: '' };
	},

	doSearch( searchBoxContent ) {
		const filter = getSortedFilterTerms( searchBoxContent );
		const searchString = stripFilters( searchBoxContent );
		this.updateUrl( this.props.tier || 'all', filter, searchString );
	},

	prependFilterKeys() {
		const { filter } = this.props;
		if ( filter ) {
			return filter.split( ',' ).map( getFilter ).join( ' ' ) + ' ';
		}
		return '';
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

	onTierSelect( { value: tier } ) {
		trackClick( 'search bar filter', tier );
		this.updateUrl( tier, this.props.filter );
	},

	updateUrl( tier, filter, searchString = this.props.search ) {
		const { siteSlug, vertical } = this.props;

		const siteIdSection = siteSlug ? `/${ siteSlug }` : '';
		const verticalSection = vertical ? `/${ vertical }` : '';
		const tierSection = tier === 'all' ? '' : `/${ tier }`;
		const filterSection = filter ? `/filter/${ filter }` : '';

		const url = `/design${ verticalSection }${ tierSection }${ filterSection }${ siteIdSection }`;
		page( buildUrl( url, searchString ) );
	},

	onScreenshotClick( theme, resultsRank ) {
		trackClick( 'theme', 'screenshot' );
		if ( ! this.props.isActiveTheme( theme.id ) ) {
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
				<StickyPanel>
					<ThemesSearchCard
						site={ site }
						onSearch={ this.doSearch }
						search={ this.prependFilterKeys() + this.props.search }
						tier={ this.props.tier }
						select={ this.onTierSelect } />
				</StickyPanel>
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
						isActive={ this.props.isActiveTheme }
						isPurchased={ this.props.isThemePurchased } />
				</ThemesData>
			</div>
		);
	},

} );

export default connect(
	( state, { siteId } ) => ( {
		siteSlug: getSiteSlug( state, siteId ),
		isActiveTheme: themeId => isActiveTheme( state, themeId, siteId ),
		// Note: This component assumes that purchase data is already present in the state tree
		// (used by the isThemePurchased selector). At the time of implementation there's no caching
		// in <QuerySitePurchases /> and a parent component is already rendering it. So to avoid
		// redundant AJAX requests, we're not rendering the query component locally.
		isThemePurchased: themeId => isThemePurchased( state, themeId, siteId )
	} )
)( ThemesSelection );
