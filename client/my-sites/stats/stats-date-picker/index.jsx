/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { localize, moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import userUtils from 'lib/user/utils';

class StatsDatePicker extends Component {
	static propTypes = {
		period: PropTypes.string.isRequired,
		date: PropTypes.oneOfType( [
			PropTypes.object.isRequired,
			PropTypes.string.isRequired
		] ),
		summary: PropTypes.bool,
		translate: PropTypes.func,
	}

	dateForDisplay() {
		const locale = userUtils.getLocaleSlug();
		const date = moment( this.props.date );
		if ( date.locale() !== locale ) {
			date.locale( locale );
		}
		let formattedDate;

		switch ( this.props.period ) {
			case 'week':
				formattedDate = this.props.translate(
					'%(startDate)s - %(endDate)s',
					{
						context: 'Date range for which stats are being displayed',
						args: {
							// LL is a date localized by momentjs
							startDate: date.startOf( 'week' ).add( 1, 'd' ).format( 'LL' ),
							endDate: date.endOf( 'week' ).add( 1, 'd' ).format( 'LL' )
						}
					}
				);
				break;

			case 'month':
				formattedDate = date.format( 'MMMM YYYY' );
				break;

			case 'year':
				formattedDate = date.format( 'YYYY' );
				break;

			default:
				// LL is a date localized by momentjs
				formattedDate = date.format( 'LL' );
		}

		return formattedDate;
	}

	render() {
		const sectionTitle = this.props.translate( 'Stats for {{period/}}', {
			components: {
				period: <span>{ this.dateForDisplay() }</span>
			},
			context: 'Stats: Main stats page heading',
			comment: 'Example: "Stats for December 7", "Stats for December 8 - December 14", "Stats for December", "Stats for 2014"'
		} );

		return (
			<div>
				{ this.props.summary
					? <span>{ sectionTitle }</span>
					: <h3 className="stats-date-picker__title">{ sectionTitle }</h3>
				}
			</div>
		);
	}
}

export default localize( StatsDatePicker );
