/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { localize } from 'i18n-calypso';

class StatsDatePicker extends Component {
	static propTypes = {
		date: PropTypes.oneOfType( [
			PropTypes.object.isRequired,
			PropTypes.string.isRequired
		] ),
		period: PropTypes.string.isRequired,
		summary: PropTypes.bool,
	};

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
		const { summary, translate } = this.props;

		const sectionTitle = translate( 'Stats for {{period/}}', {
			components: {
				period: (
					<span className="period">
						<span className="date">{ this.dateForDisplay() }</span>
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
					: <h3 className="stats-section-title">{ sectionTitle }</h3>
				}
			</div>
		);
	}
}

export default localize( StatsDatePicker );
