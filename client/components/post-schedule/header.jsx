/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Local dependencies
 */
import { withLocalizedMoment } from 'components/localized-moment';
import HeaderControl from './header-controls';

/**
 * Globals
 */
const noop = () => {};

class PostScheduleHeader extends React.Component {
	static propTypes = {
		date: PropTypes.object,
		inputChronoDisplayed: PropTypes.bool,
		onDateChange: PropTypes.func,
	};

	static defaultProps = {
		inputChronoDisplayed: true,
		onDateChange: noop,
	};

	state = {
		showYearControls: false,
	};

	setToCurrentMonth = () => {
		const { moment, date, onDateChange } = this.props;
		onDateChange( moment( date ).month( moment().month() ) );
	};

	setToCurrentYear = () => {
		const { moment, date, onDateChange } = this.props;
		onDateChange( moment( date ).year( moment().year() ) );
	};

	setYear = ( modifier ) => {
		const { moment, date, onDateChange } = this.props;
		const newDate = moment( date ).add( modifier, 'y' );

		if ( 0 > newDate.year() || newDate.year() > 9999 ) {
			return null;
		}

		onDateChange( newDate );
	};

	render() {
		const headerClasses = classNames( 'post-schedule__header', {
			'is-input-chrono-displayed': this.props.inputChronoDisplayed,
		} );

		/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
		return (
			<div className={ headerClasses }>
				<span className="post-schedule__header-month" onClick={ this.setToCurrentMonth }>
					{ this.props.date.clone().format( 'MMM' ) }
				</span>

				<div
					className="post-schedule__header-year"
					onMouseEnter={ () => {
						this.setState( { showYearControls: true } );
					} }
					onMouseLeave={ () => {
						this.setState( { showYearControls: false } );
					} }
				>
					<span onClick={ this.setToCurrentYear }>
						{ this.props.date.clone().format( 'YYYY' ) }
					</span>

					{ this.state.showYearControls && <HeaderControl onYearChange={ this.setYear } /> }
				</div>
			</div>
		);
		/* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
	}
}

export default withLocalizedMoment( PostScheduleHeader );
