/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	debug = require( 'debug' )( 'calypso:stats:module-date-picker' );

/**
 * Internal dependencies
 */

module.exports = React.createClass({
	displayName: 'StatsModuleDatePicker',

	// This is going to need some i18n love
	dateForDisplay: function() {
		var date = this.moment( this.props.date ),
			formattedDate = '';

		switch( this.props.period ) {
			case 'week':
				formattedDate = this.translate(
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
	},

	render: function() {
		debug( 'Rendering stats date picker' );

		var date = this.dateForDisplay(),
			period = ( <span className="period"><span className="date">{ date }</span></span> ),
			sectionTitle,
			dateDisplay;

		sectionTitle = this.translate( 'Stats for {{period/}}', {
			components: {
				period: period
			},
			context: 'Stats: Main stats page heading',
			comment: 'Example: "Stats for December 7", "Stats for December 8 - December 14", "Stats for December", "Stats for 2014"'
		} );

		if ( this.props.summary ) {
			dateDisplay = (
				<h4 className="module-header-title" key="header-title">{ sectionTitle }</h4> );
		} else {
			dateDisplay = ( <h3 className="stats-section-title">{ sectionTitle }</h3> );
		}

		return dateDisplay;
	}
});
