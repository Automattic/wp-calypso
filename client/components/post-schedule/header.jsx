/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Local dependencies
 */
import HeaderControl from './header-controls';
import classNames from 'classnames';

/**
 * Globals
 */
var noop = () => {};

class PostScheduleHeader extends React.Component {
	static displayName = 'PostScheduleHeader';

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
		var month = this.props.moment().month();
		this.props.onDateChange( this.props.date.month( month ) );
	};

	setToCurrentYear = () => {
		var year = this.props.moment().year();
		this.props.onDateChange( this.props.date.year( year ) );
	};

	setYear = modifier => {
		var date = this.props.moment( this.props.date );
		date.year( date.year() + modifier );

		if ( 0 > date.year() || date.year() > 9999 ) {
			return null;
		}

		this.props.onDateChange( date );
	};

	render() {
		const headerClasses = classNames( 'post-schedule__header', {
			'is-input-chrono-displayed': this.props.inputChronoDisplayed,
		} );

		return (
			<div className={ headerClasses }>
				<span className="post-schedule__header-month" onClick={ this.setToCurrentMonth }>
					{ this.props.date.format( 'MMMM' ) }
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
					<span onClick={ this.setToCurrentYear }>{ this.props.date.format( 'YYYY' ) }</span>

					{ this.state.showYearControls && <HeaderControl onYearChange={ this.setYear } /> }
				</div>
			</div>
		);
	}
}

export default localize( PostScheduleHeader );
