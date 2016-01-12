/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteOverview from './stats-site-overview';
import SiteOverviewPlaceholder from './stats-overview-placeholder';
import DatePicker from './stats-date-picker';
import StatsNavigation from './stats-navigation';
import Main from 'components/main';

export default React.createClass( {
	displayName: 'StatsOverview',

	mixins: [ observe( 'sites' ) ],

	propTypes: {
		statSummaryList: PropTypes.object,
		path: PropTypes.string
	},

	render() {
		const { statSummaryList, path } = this.props;
		const sites = this.props.sites.getVisible();
		const statsPath = ( path === '/stats' ) ? '/stats/day' : path;

		const sitesSorted = sites.map( function( site ) {
			var momentSiteZone = this.moment();

			if ( 'object' === typeof ( site.options ) && 'undefined' !== typeof ( site.options.gmt_offset ) ) {
				momentSiteZone = this.moment().utcOffset( site.options.gmt_offset );
			}
			site.periodEnd = momentSiteZone.endOf( this.props.period ).format( 'YYYY-MM-DD' );
			return site;
		}, this );

		sitesSorted.sort( function( a, b ) {
			if ( a.periodEnd > b.periodEnd ) {
				return 1;
			}
			if ( a.periodEnd < b.periodEnd ) {
				return -1;
			}
			if ( a.primary ) {
				return -1;
			}
			if ( b.primary ) {
				return 1;
			}
			if ( a.title.toUpperCase() > b.title.toUpperCase() ) {
				return 1;
			}
			if ( a.title.toUpperCase() < b.title.toUpperCase() ) {
				return -1;
			}
			return 0;
		} );

		const sitesList = sitesSorted.map( function( site, index ) {
			let siteOffset = 0;
			const overview = [];

			if ( 'object' === typeof ( site.options ) && 'undefined' !== typeof ( site.options.gmt_offset ) ) {
				siteOffset = site.options.gmt_offset;
			}

			const date = this.moment().utcOffset( siteOffset ).format( 'YYYY-MM-DD' );
			const summaryData = statSummaryList.get( site.ID, date );

			if ( 0 === index || sitesSorted[ index - 1 ].periodEnd !== site.periodEnd ) {
				overview.push( <DatePicker period={ this.props.period } date={ date } /> );
			}

			overview.push(
				<SiteOverview key={ site.ID } site={ site } summaryData={ summaryData } path={ statsPath } />
			);

			return overview;
		}, this );

		return (
			<Main>
				<SidebarNavigation />
				<StatsNavigation section={ this.props.period } />
				{ sites.length !== 0 ? sitesList : this.placeholders() }
			</Main>
		);
	},

	placeholders() {
		const items = [];
		const limit = Math.min( this.props.user.get().visible_site_count, 10 );

		items.push( <h3 className="stats-section-title">&nbsp;</h3> );

		for ( let i = 0; i < limit; i++ ) {
			items.push( <SiteOverviewPlaceholder key={ i } /> );
		}

		return items;
	}
} );
