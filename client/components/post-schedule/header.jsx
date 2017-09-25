/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import HeaderControl from './header-controls';

/**
 * Globals
 */
const noop = () => {};

export default localize( React.createClass( {
	propTypes: {
		date: PropTypes.object,
		inputChronoDisplayed: PropTypes.bool,
		onDateChange: PropTypes.func,
	},

	getDefaultProps() {
		return {
			inputChronoDisplayed: true,
			onDateChange: noop
		};
	},

	getInitialState() {
		return {
			showYearControls: false
		};
	},

	setToCurrentMonth() {
		const month = this.props.moment().month();
		this.props.onDateChange( this.props.date.month( month ) );
	},

	setToCurrentYear() {
		const year = this.props.moment().year();
		this.props.onDateChange( this.props.date.year( year ) );
	},

	setYear( modifier ) {
		const date = this.props.moment( this.props.date );
		date.year( date.year() + modifier );

		if ( 0 > date.year() || date.year() > 9999 ) {
			return null;
		}

		this.props.onDateChange( date );
	},

	render() {
		const headerClasses = classNames( 'post-schedule__header', { 'is-input-chrono-displayed': this.props.inputChronoDisplayed } );

		return (
			<div className={ headerClasses }>
				<span
					className="post-schedule__header-month"
					onClick={ this.setToCurrentMonth }
				>
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
					<span onClick={ this.setToCurrentYear }>
						{ this.props.date.format( 'YYYY' ) }
					</span>

					{
						this.state.showYearControls &&
						<HeaderControl onYearChange={ this.setYear } />
					}
				</div>
			</div>
		);
	}
} ) );
