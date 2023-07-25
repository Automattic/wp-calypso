import { useQuery } from '@tanstack/react-query';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import wpcom from 'calypso/lib/wp';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getVisibleSites from 'calypso/state/selectors/get-visible-sites';
import DatePicker from './stats-date-picker';
import SiteOverviewPlaceholder from './stats-overview-placeholder';
import PageViewTracker from './stats-page-view-tracker';
import SiteOverview from './stats-site-overview';

// for using react-query in class components
// should extract
function Query( props ) {
	return props.children(
		useQuery( {
			queryKey: props.queryKey,
			queryFn: props.queryFn,
		} )
	);
}

const emptyObject = {};

class StatsOverview extends Component {
	static propTypes = {
		moment: PropTypes.func,
		path: PropTypes.string,
		period: PropTypes.string,
		sites: PropTypes.array,
	};

	generateSiteList = ( sitesSorted, data ) => {
		const { moment, path, period } = this.props;
		const statsPath = path === '/stats' ? '/stats/day' : path;
		return sitesSorted.map( ( site, index ) => {
			const summaryData = data && data.stats && data.stats[ site.ID ];
			const gmtOffset = get( site, 'options.gmt_offset' );
			const date = moment()
				.utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 )
				.format( 'YYYY-MM-DD' );

			return (
				<Fragment key={ site.ID }>
					{ ( 0 === index || sitesSorted[ index - 1 ].periodEnd !== site.periodEnd ) && (
						<DatePicker period={ period } date={ date } />
					) }
					<SiteOverview
						siteId={ site.ID }
						path={ statsPath }
						title={ site.title }
						siteSlug={ site.slug }
						summaryData={ summaryData || emptyObject }
					/>
				</Fragment>
			);
		} );
	};

	render() {
		const { moment, period, sites, translate } = this.props;
		const sitesSorted = sites.map( ( site ) => {
			let momentSiteZone = moment();
			const gmtOffset = get( site, 'options.gmt_offset' );
			if ( Number.isFinite( gmtOffset ) ) {
				momentSiteZone = moment().utcOffset( gmtOffset );
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

		const date = new Date().toISOString().split( 'T' )[ 0 ];

		return (
			<Main wideLayout>
				<DocumentHead title={ translate( 'Stats' ) } />
				<PageViewTracker
					path={ `/stats/${ period }` }
					title={ `Stats > ${ titlecase( period ) }` }
				/>
				<StatsNavigation selectedItem="traffic" interval={ period } isLegacy />
				<Query
					queryKey={ [ 'stats', 'summary', 'all-sites', period, date ] }
					queryFn={ () =>
						wpcom.req.get( {
							apiNamespace: 'wpcom/v2',
							path: `/me/sites/stats/summary?period=${ period }&date=${ date }`,
						} )
					}
				>
					{ ( { data } ) => (
						<>
							{ sites.length !== 0
								? this.generateSiteList( sitesSorted, data )
								: this.placeholders() }
						</>
					) }
				</Query>
				<JetpackColophon />
			</Main>
		);
	}

	placeholders() {
		const items = [];
		const limit = Math.min( this.props.user.visible_site_count, 10 );

		// TODO: a separate StatsSectionTitle component should be created
		items.push(
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<h3 key="header-placeholder" className="stats-section-title">
				&nbsp;
			</h3>
		); // eslint-disable-line wpcalypso/jsx-classname-namespace

		for ( let i = 0; i < limit; i++ ) {
			items.push( <SiteOverviewPlaceholder key={ 'placeholder-' + i } /> );
		}

		return items;
	}
}

export default connect( ( state ) => {
	return {
		user: getCurrentUser( state ),
		sites: getVisibleSites( state ),
	};
} )( localize( withLocalizedMoment( StatsOverview ) ) );
