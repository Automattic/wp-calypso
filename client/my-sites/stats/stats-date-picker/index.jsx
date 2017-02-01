/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { localize } from 'i18n-calypso';
import { flowRight, get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';
import { getSiteStatsQueryDate } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isRequestingSiteStatsForQuery } from 'state/stats/lists/selectors';

class StatsDatePicker extends Component {
	static propTypes = {
		date: PropTypes.oneOfType( [
			PropTypes.object.isRequired,
			PropTypes.string.isRequired
		] ),
		period: PropTypes.string.isRequired,
		summary: PropTypes.bool,
		query: PropTypes.object,
		statType: PropTypes.string,
		showQueryDate: PropTypes.bool,
	};

	static defaultProps = {
		showQueryDate: false
	};

	dateForSummarize() {
		const { query, moment, translate } = this.props;
		const localizedDate = moment();

		switch ( query.num ) {
			case '-1':
				return translate( 'All Time' );

			default:
				return translate(
					'%(number)s days ending %(endDate)s (Summarized)',
					{
						context: 'Date range for which stats are being displayed',
						args: {
							// LL is a date localized by momentjs
							number: parseInt( query.num ),
							endDate: localizedDate.format( 'LL' )
						}
					}
				);
		}
	}

	dateForDisplay() {
		const { date, moment, period, translate } = this.props;
		const localizedDate = moment( date );
		let formattedDate;

		switch ( period ) {
			case 'week':
				formattedDate = translate(
					'%(startDate)s - %(endDate)s',
					{
						context: 'Date range for which stats are being displayed',
						args: {
							// LL is a date localized by momentjs
							startDate: localizedDate.startOf( 'week' ).add( 1, 'd' ).format( 'LL' ),
							endDate: localizedDate.endOf( 'week' ).add( 1, 'd' ).format( 'LL' )
						}
					}
				);
				break;

			case 'month':
				formattedDate = localizedDate.format( 'MMMM YYYY' );
				break;

			case 'year':
				formattedDate = localizedDate.format( 'YYYY' );
				break;

			default:
				// LL is a date localized by momentjs
				formattedDate = localizedDate.format( 'LL' );
		}

		return formattedDate;
	}

	render() {
		const { summary, translate, query, queryDate, requesting, moment, showQueryDate } = this.props;
		const isSummarizeQuery = get( query, 'summarize' );

		const sectionTitle = translate( 'Stats for {{period/}}', {
			components: {
				period: (
					<span className="period">
						<span className="date">{ isSummarizeQuery ? this.dateForSummarize() : this.dateForDisplay() }</span>
					</span>
				)
			},
			context: 'Stats: Main stats page heading',
			comment: 'Example: "Stats for December 7", "Stats for December 8 - December 14", "Stats for December", "Stats for 2014"'
		} );

		return (
			<div>
				{ summary
					? <span>{ sectionTitle }</span>
					: <div className="stats-section-title">
							<h3>{ sectionTitle }</h3>
							{ showQueryDate && <span className="stats-date-picker__update-date">
								{ queryDate && translate( 'Last update: %(time)s', {
									args: { time: moment( queryDate ).format( 'HH:mm' ) }
								} ) }
								{ requesting && <Gridicon icon="sync" size={ 15 } /> }
							</span> }
						</div>
				}
			</div>
		);
	}
}

const connectComponent = connect(
	( state, { query, statsType, showQueryDate } ) => {
		const siteId = getSelectedSiteId( state );
		return {
			queryDate: showQueryDate ? getSiteStatsQueryDate( state, siteId, statsType, query ) : null,
			requesting: showQueryDate ? isRequestingSiteStatsForQuery( state, siteId, statsType, query ) : false,
		};
	}
);

export default flowRight(
	connectComponent,
	localize
)( StatsDatePicker );
