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
		date: PropTypes.instanceOf( Date ).isRequired,
		onChange: PropTypes.func.isRequired,
	};

	getFormattedDate = date => this.props.moment( date ).format( DATE_FORMAT );

	getDisplayDate = date => {
		const word = this.props
			.moment( date )
			.calendar()
			.split( ' ' )[ 0 ];
		if ( 'Today' === word || 'Yesterday' === word ) {
			return word;
		}

		return this.getFormattedDate( date );
	};

	shuttleLeft = () => {
		const { date, onChange, moment } = this.props;
		const newDate = moment( date )
			.subtract( 1, 'days' )
			.toDate();

		onChange( newDate );
	};

	shuttleRight = () => {
		if ( ! this.canShuttleRight() ) {
			return false;
		}

		const { date, onChange, moment } = this.props;
		const newDate = moment( date )
			.add( 1, 'days' )
			.toDate();

		onChange( newDate );
	};

	canShuttleRight = () => ! this.props.moment().isSame( this.props.date, 'day' );

	render() {
		const { date, siteId } = this.props;

		const currentDisplayDate = this.getDisplayDate( date );

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
