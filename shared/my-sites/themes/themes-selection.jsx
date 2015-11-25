/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import partial from 'lodash/function/partial';
import page from 'page';

/**
 * Internal dependencies
 */
import Action from 'lib/themes/flux-actions';
import Helper from 'lib/themes/helpers';
import ThemesSearchCard from './themes-search-card';
import ThemesData from 'components/data/themes-list-fetcher';
import ThemesList from 'components/themes-list';
import ThemesListStore from 'lib/themes/stores/themes-list';
import StickyPanel from 'components/sticky-panel';
import analytics from 'analytics';
import buildUrl from 'lib/mixins/url-search/build-url';
import urlSearch from 'lib/mixins/url-search';
import config from 'config';

const ThemesSelection = React.createClass( {
	mixins: [ urlSearch ],

	propTypes: {
		sites: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ).isRequired,
		siteId: PropTypes.string,
		search: PropTypes.string,
		setSelectedTheme: PropTypes.func.isRequired,
		togglePreview: PropTypes.func.isRequired,
		getOptions: PropTypes.func.isRequired
	},

	getInitialState: function() {
		return {
			tier: this.props.tier || config.isEnabled( 'premium-themes' ) ? 'all' : 'free'
		};
	},

	onMoreButtonClick( theme, resultsRank ) {
		this.recordSearchResultsClick( theme, resultsRank );
	},

	recordSearchResultsClick( theme, resultsRank ) {
		const queryParams = ThemesListStore.getQueryParams();
		analytics.tracks.recordEvent( 'calypso_themeshowcase_theme_click', {
			search_term: queryParams.search,
			theme: theme.id,
			results_rank: resultsRank + 1,
			results: ThemesListStore.get(),
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
		const siteId = this.props.siteId ? `/${this.props.siteId}` : '';
		const url = `/design/type/${tier}${siteId}`;
		this.setState( { tier } );
		Helper.trackClick( 'search bar filter', tier );
		page( buildUrl( url, this.props.search ) );
	},

	onScreenshotClick( theme, resultsRank ) {
		const site = this.props.sites.getSelectedSite();

		Helper.trackClick( 'theme', 'screenshot' );
		if ( theme.active && site ) {
			Action.customize( theme, site );
		} else {
			this.recordSearchResultsClick( theme, resultsRank );
			this.props.togglePreview( theme );
		}
	},

	render() {
		var site = this.props.sites.getSelectedSite();
		return (
			<div className="themes__selection">
				<StickyPanel>
					<ThemesSearchCard
							site={ site }
							onSearch={ this.doSearch }
							search={ this.props.search }
							tier={ this.state.tier }
							select={ this.onTierSelect } />
				</StickyPanel>
				<ThemesData
						site={ site }
						isMultisite={ ! this.props.siteId } // Not the same as `! site` !
						search={ this.props.search }
						tier={ this.state.tier }
						onRealScroll={ this.trackScrollPage }
						onLastPage={ this.trackLastPage } >
					<ThemesList getButtonOptions={ this.props.getOptions.bind( null, site ) }
						onMoreButtonClick={ this.onMoreButtonClick }
						onScreenshotClick={ this.onScreenshotClick }
						getScreenshotUrl={ site ? partial( Helper.getPreviewUrl, partial.placeholder, site ) : null } />
				</ThemesData>
			</div>
		);
	},

} );

export default ThemesSelection;
