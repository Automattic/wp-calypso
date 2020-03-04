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
	state = {
		currentSetting: false,
	};

	static propTypes = {
		siteId: PropTypes.number.isRequired,
		initialDate: PropTypes.instanceOf( Date ).isRequired,
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
		const { initialDate, moment } = this.props;
		const currentSetting = moment(
			this.state.currentSetting ? this.state.currentSetting : initialDate
		).subtract( 1, 'days' );
		this.setState( { currentSetting } );
		this.props.onChange( currentSetting.format( DATE_FORMAT ) );
	};

	shuttleRight = () => {
		if ( ! this.canShuttleRight() ) {
			return false;
		}

		const { initialDate, moment } = this.props;
		const currentSetting = moment(
			this.state.currentSetting ? this.state.currentSetting : initialDate
		).add( 1, 'days' );
		this.setState( { currentSetting } );
		this.props.onChange( currentSetting.format( DATE_FORMAT ) );
	};

	canShuttleRight = () =>
		this.props.moment().format( DATE_FORMAT ) !==
		this.props
			.moment( this.state.currentSetting ? this.state.currentSetting : this.props.initialDate )
			.format( DATE_FORMAT );

	render() {
		const { initialDate, siteId } = this.props;
		const { currentSetting } = this.state;

		const currentDisplayDate = currentSetting
			? this.getDisplayDate( currentSetting )
			: this.getDisplayDate( initialDate );

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
