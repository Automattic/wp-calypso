/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteOverview from './stats-site-overview';
import SiteOverviewPlaceholder from './stats-overview-placeholder';
import DatePicker from './stats-date-picker';
import StatsNavigation from './stats-navigation';
import Main from 'components/main';
import StatsFirstView from './stats-first-view';
import QuerySites from 'components/data/query-sites';
import { getCurrentUser } from 'state/current-user/selectors';
import { getVisibleSites } from 'state/selectors';

class StatsOverview extends Component {
	static propTypes = {
		moment: PropTypes.func,
		path: PropTypes.string,
		period: PropTypes.string,
		sites: PropTypes.array,
	};

	render() {
		const { moment, path, period, sites } = this.props;
		const statsPath = ( path === '/stats' ) ? '/stats/day' : path;
		const sitesSorted = sites.map( ( site ) => {
			let momentSiteZone = moment();
			if ( 'object' === typeof ( site.options ) && 'undefined' !== typeof ( site.options.gmt_offset ) ) {
				momentSiteZone = moment().utcOffset( site.options.gmt_offset );
			}
			site.periodEnd = momentSiteZone.endOf( period ).format( 'YYYY-MM-DD' );
			return site;
		} );

		sitesSorted.sort( ( a, b ) => {
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

		const sitesList = sitesSorted.map( ( site, index ) => {
			let siteOffset = 0;
			const overview = [];

			if ( 'object' === typeof ( site.options ) && 'undefined' !== typeof ( site.options.gmt_offset ) ) {
				siteOffset = site.options.gmt_offset;
			}

			const date = moment().utcOffset( siteOffset ).format( 'YYYY-MM-DD' );

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
		} );

		return (
			<Main wideLayout>
				<QuerySites allSites />
				<StatsFirstView />
				<SidebarNavigation />
				<StatsNavigation section={ period } />
				{ sites.length !== 0 ? sitesList : this.placeholders() }
			</Main>
		);
	}

	placeholders() {
		const items = [];
		const limit = Math.min( this.props.user.visible_site_count, 10 );

		// TODO: a separate StatsSectionTitle component should be created
		items.push( <h3 key="header-placeholder" className="stats-section-title">&nbsp;</h3> ); // eslint-disable-line wpcalypso/jsx-classname-namespace

		for ( let i = 0; i < limit; i++ ) {
			items.push( <SiteOverviewPlaceholder key={ 'placeholder-' + i } /> );
		}

		return items;
	}
}

export default connect(
	state => {
		return {
			user: getCurrentUser( state ),
			sites: getVisibleSites( state )
		};
	}
)( localize( StatsOverview ) );
