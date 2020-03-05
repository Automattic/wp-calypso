/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { withLocalizedMoment } from 'components/localized-moment';
import Button from 'components/forms/form-button';
import DateRangeSelector from 'my-sites/activity/filterbar/date-range-selector';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

const DATE_FORMAT = 'YYYY-MM-DD';

class DatePicker extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		selectedDateString: PropTypes.string.isRequired,
		onChange: PropTypes.func.isRequired,
	};

	getFormattedDate = dateString => this.props.moment.parseZone( dateString ).format( DATE_FORMAT );

	getDisplayDate = dateString => {
		const word = this.props.moment
			.parseZone( dateString )
			.calendar()
			.split( ' ' )[ 0 ];
		if ( 'Today' === word || 'Yesterday' === word ) {
			return word;
		}

		return this.getFormattedDate( dateString );
	};

	shuttleLeft = () => {
		const { moment, onChange, selectedDateString } = this.props;
		const newDateString = moment
			.parseZone( selectedDateString )
			.subtract( 1, 'days' )
			.toISOString( true );

		onChange( newDateString );
	};

	shuttleRight = () => {
		if ( ! this.canShuttleRight() ) {
			return false;
		}

		const { moment, onChange, selectedDateString } = this.props;
		const newDateString = moment
			.parseZone( selectedDateString )
			.add( 1, 'days' )
			.toISOString( true );

		onChange( newDateString );
	};

	canShuttleRight = () => {
		const { moment, selectedDateString } = this.props;
		return ! moment().isSame( moment.parseZone( selectedDateString ), 'day' );
	};

	render() {
		const { selectedDateString, siteId } = this.props;

		const currentDisplayDate = this.getDisplayDate( selectedDateString );

		return (
			<div className="date-picker">
				<Button compact borderless onClick={ this.shuttleLeft }>
					<Gridicon icon="chevron-left" />
				</Button>

				<div className="date-picker__current-display-date">{ currentDisplayDate }</div>

				<Button compact borderless onClick={ this.shuttleRight }>
					<Gridicon icon="chevron-right" className={ ! this.canShuttleRight() && 'disabled' } />
				</Button>

				<DateRangeSelector
					siteId={ siteId }
					enabled={ true }
					customLabel={ <Gridicon icon="calendar" /> }
				/>
			</div>
		);
	}
}

export default localize( withLocalizedMoment( DatePicker ) );
