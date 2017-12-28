/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'state/stats/lists/selectors';

class AnnualSiteStats extends Component {
	static propTypes = {
		requesting: PropTypes.bool,
		siteId: PropTypes.number,
		years: PropTypes.object,
		translate: PropTypes.func,
	};

	render() {
		const { years, requesting, siteId, translate, statType } = this.props;
		const year = years && years[ '2011' ];
		if ( ! year ) {
			return null; // for now
		}
		const classes = classNames( 'stats-module', {
			'is-loading': requesting && ! years,
			'is-empty': ! years,
		} );

		return (
			<div>
				{ siteId && <QuerySiteStats siteId={ siteId } statType={ statType } /> }
				<SectionHeader label={ translate( 'Annual Site Stats' ) } />
				<Card className={ classes }>
					<div className="annual-site-stats__content">
						<div className="annual-site-stats__stat">
							<div className="annual-site-stats__stat-title">year</div>
							<div className="annual-site-stats__stat-figure is-large">2011</div>
						</div>
						<div className="annual-site-stats__stat">
							<div className="annual-site-stats__stat-title">total posts</div>
							<div className="annual-site-stats__stat-figure is-large">{ year.total_posts }</div>
						</div>
						<div className="annual-site-stats__stat">
							<div className="annual-site-stats__stat-title">total comments</div>
							<div className="annual-site-stats__stat-figure">{ year.total_comments }</div>
						</div>
						<div className="annual-site-stats__stat">
							<div className="annual-site-stats__stat-title">total words</div>
							<div className="annual-site-stats__stat-figure">{ year.total_words }</div>
						</div>
						<div className="annual-site-stats__stat">
							<div className="annual-site-stats__stat-title">avg comments per post</div>
							<div className="annual-site-stats__stat-figure">{ year.avg_comments }</div>
						</div>
						<div className="annual-site-stats__stat">
							<div className="annual-site-stats__stat-title">avg words per post</div>
							<div className="annual-site-stats__stat-figure">{ year.avg_words }</div>
						</div>
					</div>
				</Card>
			</div>
		);
	}
}

export default connect( state => {
	const statType = 'statsInsights';
	const siteId = getSelectedSiteId( state );
	const insights = getSiteStatsNormalizedData( state, siteId, statType, {} );

	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, {} ),
		siteId,
		statType,
		years: insights.years,
	};
} )( localize( AnnualSiteStats ) );
