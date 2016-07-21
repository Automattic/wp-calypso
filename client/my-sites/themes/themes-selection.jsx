/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { trackClick } from './helpers';
import ThemesSearchCard from './themes-search-card';
import ThemesData from 'components/data/themes-list-fetcher';
import ThemesList from 'components/themes-list';
import StickyPanel from 'components/sticky-panel';
import analytics from 'lib/analytics';
import buildUrl from 'lib/mixins/url-search/build-url';

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

	doSearch( searchString ) {
		const filterRegex = /[a-zA-Z0-9]+\:\s*([a-zA-Z0-9-_]+)/g;

		let matches;
		const filterStrings = [];
		while ( ( matches = filterRegex.exec( searchString ) ) !== null ) {
			if ( matches[ 1 ] ) {
				filterStrings.push( matches[ 1 ] );
			}
		}
		filterStrings.sort();
		const filter = filterStrings.join( ' ' );

		searchString = searchString.replace( filterRegex, '' ).trim();
		this.updateUrl( this.props.tier || 'all', filter, searchString );
	},

	prependFilterKeys() {
		const { filter } = this.props;
		if ( filter ) {
			return filter.split( ' ' ).map( value => `filter:${ value }` ).join( ' ' ) + ' ';
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
		const filterSection = filter ? `/filter/${ filter.replace( ' ', '+' ) }` : '';
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
							search={ this.prependFilterKeys() + ( this.props.search || '' ) }
							tier={ this.props.tier }
							select={ this.onTierSelect } />
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
