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
import { Card } from '@automattic/components';
import Notice from 'components/notice';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'state/stats/lists/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class StatsMostPopular extends Component {
	static propTypes = {
		day: PropTypes.string,
		percent: PropTypes.number,
		hour: PropTypes.string,
		hourPercent: PropTypes.number,
		requesting: PropTypes.bool,
		siteId: PropTypes.number,
		query: PropTypes.object,
		translate: PropTypes.func,
	};

	render() {
		const { day, percent, hour, hourPercent, requesting, siteId, translate, statType } = this.props;

		const classes = classNames( 'most-popular', 'stats-module', 'is-site-overview', {
			'is-loading': requesting && ! percent,
			'is-empty': ! percent,
		} );
		return (
			<div>
				{ siteId && <QuerySiteStats siteId={ siteId } statType={ statType } /> }
				<SectionHeader label={ translate( 'Most popular day and hour' ) } />
				<Card className={ classes }>
					<div className="most-popular__wrapper">
						<div className="most-popular__item">
							<span className="most-popular__label">{ translate( 'Most popular day' ) }</span>
							<span className="most-popular__day">{ day }</span>
							<span className="most-popular__percentage">
								{ translate( '%(percent)d%% of views', {
									args: { percent: percent || 0 },
									context: 'Stats: Percentage of views',
								} ) }
							</span>
						</div>
						<div className="most-popular__item">
							<span className="most-popular__label">{ translate( 'Most popular hour' ) }</span>
							<span className="most-popular__hour">{ hour }</span>
							<span className="most-popular__percentage">
								{ translate( '%(percent)d%% of views', {
									args: { percent: hourPercent || 0 },
									context: 'Stats: Percentage of views',
								} ) }
							</span>
						</div>
						{ ! percent && ! requesting && (
							<div className="most-popular__empty">
								<Notice
									className="most-popular__notice"
									status="is-warning"
									isCompact
									text={ translate( 'No popular day and time recorded', {
										context: 'Message on stats insights page when no most popular data exists.',
										comment: 'Should be limited to 32 characters to prevent wrapping',
									} ) }
									showDismiss={ false }
								/>
							</div>
						) }
					</div>
				</Card>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const statType = 'statsInsights';
	const siteId = getSelectedSiteId( state );
	const mostPopularData = getSiteStatsNormalizedData( state, siteId, statType, {} );

	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, {} ),
		siteId,
		statType,
		...mostPopularData,
	};
} )( localize( StatsMostPopular ) );
