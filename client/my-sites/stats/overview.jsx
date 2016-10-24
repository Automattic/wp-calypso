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
import StatsFirstView from './stats-first-view';

export default React.createClass( {
	displayName: 'StatsOverview',

	mixins: [ observe( 'sites' ) ],

	propTypes: {
		path: PropTypes.string
	},

	render() {
		const { path, period } = this.props;
		const sites = this.props.sites.getVisible();
		const statsPath = ( path === '/stats' ) ? '/stats/day' : path;

		const sitesSorted = sites.map( function( site ) {
			let momentSiteZone = this.moment();

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

			if ( 0 === index || sitesSorted[ index - 1 ].periodEnd !== site.periodEnd ) {
				overview.push( <DatePicker period={ period } date={ date } /> );
			}

			overview.push(
				<SiteOverview
					key={ site.ID }
					siteId={ site.ID }
					period={ period }
					date={ date }
					path={ statsPath }
					title={ site.title }
					siteSlug={ site.slug }
				/>
			);

			return overview;
		}, this );

		return (
			<Main>
				<StatsFirstView />
				<SidebarNavigation />
				<StatsNavigation section={ this.props.period } />
				{ sites.length !== 0 ? sitesList : this.placeholders() }
			</Main>
		);
	},

	placeholders() {
		const items = [];
		const limit = Math.min( this.props.user.get().visible_site_count, 10 );

		// TODO: a separate StatsSectionTitle component should be created
		items.push( <h3 className="stats-section-title">&nbsp;</h3> ); // eslint-disable-line wpcalypso/jsx-classname-namespace

		for ( let i = 0; i < limit; i++ ) {
			items.push( <SiteOverviewPlaceholder key={ i } /> );
		}

		return items;
	}
} );
