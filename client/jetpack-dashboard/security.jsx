/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QuerySites from 'components/data/query-sites';
import { requestActivityLogs } from 'state/data-getters';
import { getSite } from 'state/sites/selectors';

class JetpackDashboardSecurity extends React.PureComponent {
	render() {
		const { logs, moment, site, siteId } = this.props;

		if ( ! siteId ) {
			return (
				<Fragment>
					<p>
						Site not selected. Append <code>/12345</code> to the URL, where <code>12345</code> is
						your site ID.
					</p>
				</Fragment>
			);
		}

		if ( siteId && ! site ) {
			return (
				<Fragment>
					<QuerySites siteId={ siteId } />
					<p>Loading...</p>
				</Fragment>
			);
		}

		return (
			<Fragment>
				<h3>Backups events for site { site.title }</h3>
				{ logs && (
					<ul>
						{ logs.map( ( { activityDate, activityId, activityTitle } ) => (
							<li key={ 'activity-' + activityId }>
								{ activityTitle } on { moment( activityDate ).format( 'MMMM Do YYYY' ) } at{' '}
								{ moment( activityDate ).format( 'h:mm:ss a' ) }
							</li>
						) ) }
					</ul>
				) }
			</Fragment>
		);
	}
}

export default connect( ( state, { siteId } ) => {
	const logs =
		siteId &&
		requestActivityLogs( siteId, {
			group: 'rewind',
		} );

	return {
		siteId,
		site: siteId && getSite( state, siteId ),
		logs: ( siteId && logs.data ) || [],
	};
} )( localize( JetpackDashboardSecurity ) );
