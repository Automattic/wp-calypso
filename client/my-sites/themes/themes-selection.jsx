/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { trackClick } from './helpers';
import ThemesData from 'components/data/themes-list-fetcher';
import ThemesList from 'components/themes-list';
import StickyPanel from 'components/sticky-panel';
import analytics from 'lib/analytics';
import buildUrl from 'lib/mixins/url-search/build-url';
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
		siteId: PropTypes.string,
		search: PropTypes.string,
		onScreenshotClick: PropTypes.func,
		getOptions: React.PropTypes.func,
		queryParams: PropTypes.object.isRequired,
		themesList: PropTypes.array.isRequired,
		getActionLabel: React.PropTypes.func,
		tier: React.PropTypes.string,
	},

	getDefaultProps() {
		return { search: '' };
	},

	doSearch( searchBoxContent ) {
		this.updateSearchAndFilters( searchBoxContent, this.props.filter );
	},

	updateSearchAndFilters( searchBoxContent, existingFilters ) {
		const filter = [];
		const filtersFromSearchBox = getSortedFilterTerms( searchBoxContent );

		existingFilters && filter.push( existingFilters );
		filtersFromSearchBox && filter.push( filtersFromSearchBox );

		const searchString = stripFilters( searchBoxContent );
		this.updateUrl( this.props.tier || 'all', filter.join( ',' ), searchString );
	},

	// 'break into' right-most filter on backspace in empty search box
	onKeyDown( event ) {
		if ( event.key === 'Backspace' && event.target.value === '' ) {
			const activeFilters = this.prependFilterKeys();
			if ( activeFilters ) {
				const rightMostFilter = activeFilters.split( ' ' ).pop();

				const remainingFilters = this.props.filter.split( ',' );
				remainingFilters.pop();

				this.updateSearchAndFilters( rightMostFilter.substring( 0, rightMostFilter.length - 1 ), remainingFilters.join( ',' ) );
			}
		}
	},

	prependFilterKeys() {
		const { filter } = this.props;
		if ( filter ) {
			return filter.split( ',' ).map( getFilter ).join( ' ' );
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
		const siteId = this.props.siteId ? `/${this.props.siteId}` : '';
		const tierSection = tier === 'all' ? '' : `/${ tier }`;
		const filterSection = filter ? `/filter/${ filter }` : '';
		const url = `/design${ tierSection }${ filterSection }${siteId}`;

		page( buildUrl( url, searchString ) );
	},

	onScreenshotClick( theme, resultsRank ) {
		trackClick( 'theme', 'screenshot' );
		if ( ! theme.active ) {
			this.recordSearchResultsClick( theme, resultsRank );
		}
		this.props.onScreenshotClick && this.props.onScreenshotClick( theme );
	},

	render() {
		const site = this.props.selectedSite;

		return (
			<div className="themes__selection">
				<StickyPanel>
					<ThemesSearchCard
							site={ site }
							onSearch={ this.doSearch }
							search={ this.props.search }
							tier={ this.props.tier }
							select={ this.onTierSelect }
							activeFilters={ this.prependFilterKeys() }
							onKeyDown = { this.onKeyDown } />
				</StickyPanel>
				<ThemesData
						site={ site }
						isMultisite={ ! this.props.siteId } // Not the same as `! site` !
						search={ this.props.search }
						tier={ this.props.tier }
						filter={ this.props.filter }
						onRealScroll={ this.trackScrollPage }
						onLastPage={ this.trackLastPage } >
					<ThemesList getButtonOptions={ this.props.getOptions }
						onMoreButtonClick={ this.onMoreButtonClick }
						onScreenshotClick={ this.onScreenshotClick }
						getScreenshotUrl={ this.props.getScreenshotUrl }
						getActionLabel={ this.props.getActionLabel } />
				</ThemesData>
			</div>
		);
	},

} );

export default ThemesSelection;
