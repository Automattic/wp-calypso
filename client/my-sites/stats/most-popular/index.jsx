/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsInsightsData
} from 'state/stats/lists/selectors';

const StatsMostPopular = React.createClass( {
	propTypes: {
		day: PropTypes.string,
		percent: PropTypes.number,
		hour: PropTypes.string,
		hour_percent: PropTypes.number,
		requesting: PropTypes.bool,
		siteId: PropTypes.number,
		query: PropTypes.object
	},

	mixins: [ PureRenderMixin ],

	render() {
		const {
			day,
			percent,
			hour,
			hour_percent,
			requesting,
			siteId
		} = this.props;
		let emptyMessage;

		const classes = [
			'stats-module',
			'stats-most-popular',
			'is-site-overview',
			{
				'is-loading': requesting,
				'is-empty': ! percent
			}
		];

		if ( ! percent && ! requesting ) {
			// should use real notice component or custom class
			emptyMessage = (
				<div className="stats-popular__empty">
					<span className="notice">
						{ this.translate( 'No popular day and time recorded', {
							context: 'Message on empty bar chart in Stats',
							comment: 'Should be limited to 32 characters to prevent wrapping'
						} ) }
					</span>
				</div>
			);
		}

		return (
			<div>
				{ siteId && <QuerySiteStats siteId={ siteId } statType="statsInsights" /> }
				<SectionHeader label={ this.translate( 'Most popular day and hour' ) }></SectionHeader>
					<Card className={ classNames( classes ) }>
						<div className="module-content">
							<div className="stats-popular">
								<div className="stats-popular__item">
									<span className="stats-popular__label">{ this.translate( 'Most popular day' ) }</span>
									<span className="stats-popular__day">{ day }</span>
									<span className="stats-popular__percentage">{ this.translate( '%(percent)d%% of views', { args: { percent: percent || 0 }, context: 'Stats: Percentage of views' } ) }</span>
								</div>
								<div className="stats-popular__item">
									<span className="stats-popular__label">{ this.translate( 'Most popular hour' ) }</span>
									<span className="stats-popular__hour">{ hour }</span>
									<span className="stats-popular__percentage">{ this.translate( '%(percent)d%% of views', { args: { percent: hour_percent || 0 }, context: 'Stats: Percentage of views' } ) }</span>
								</div>
								{ emptyMessage }
							</div>
						</div>
					</Card>
			</div>
		);
	}
} );

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const allTimeData = getSiteStatsInsightsData( state, siteId );

	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, 'statsInsights', {} ),
		siteId,
		...allTimeData
	};
} )( StatsMostPopular );
