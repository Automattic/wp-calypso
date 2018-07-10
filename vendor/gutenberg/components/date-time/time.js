/**
 * External dependencies
 */
import { isInteger } from 'lodash';
import moment from 'moment';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Button from '../button';

/**
 * Module Constants
 */
const TIMEZONELESS_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

class TimePicker extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			hours: '',
			minutes: '',
			am: true,
			date: null,
		};
		this.updateHours = this.updateHours.bind( this );
		this.updateMinutes = this.updateMinutes.bind( this );
		this.onChangeHours = this.onChangeHours.bind( this );
		this.onChangeMinutes = this.onChangeMinutes.bind( this );
	}

	componentDidMount() {
		this.syncState( this.props );
	}

	componentDidUpdate( prevProps ) {
		const { currentTime, is12Hour } = this.props;
		if (
			currentTime !== prevProps.currentTime ||
			is12Hour !== prevProps.is12Hour
		) {
			this.syncState( this.props );
		}
	}

	syncState( { currentTime, is12Hour } ) {
		const selected = currentTime ? moment( currentTime ) : moment();
		const minutes = selected.format( 'mm' );
		const am = selected.format( 'A' );
		const hours = selected.format( is12Hour ? 'hh' : 'HH' );
		const date = currentTime ? moment( currentTime ) : moment();
		this.setState( { minutes, hours, am, date } );
	}

	updateHours() {
		const { is12Hour, onChange } = this.props;
		const { am, hours, date } = this.state;
		const value = parseInt( hours, 10 );
		if (
			! isInteger( value ) ||
			( is12Hour && ( value < 1 || value > 12 ) ) ||
			( ! is12Hour && ( value < 0 || value > 23 ) )
		) {
			this.syncState( this.props );
			return;
		}

		const newDate = is12Hour ?
			date.clone().hours( am === 'AM' ? value % 12 : ( ( ( value % 12 ) + 12 ) % 24 ) ) :
			date.clone().hours( value );
		this.setState( { date: newDate } );
		const formattedDate = newDate.format( TIMEZONELESS_FORMAT );
		onChange( formattedDate );
	}

	updateMinutes() {
		const { onChange } = this.props;
		const { minutes, date } = this.state;
		const value = parseInt( minutes, 10 );
		if ( ! isInteger( value ) || value < 0 || value > 59 ) {
			this.syncState( this.props );
			return;
		}
		const newDate = date.clone().minutes( value );
		this.setState( { date: newDate } );
		const formattedDate = newDate.format( TIMEZONELESS_FORMAT );
		onChange( formattedDate );
	}

	updateAmPm( value ) {
		return () => {
			const { onChange } = this.props;
			const { am, date, hours } = this.state;
			if ( am === value ) {
				return;
			}
			let newDate;
			if ( value === 'PM' ) {
				newDate = date.clone().hours( ( ( parseInt( hours, 10 ) % 12 ) + 12 ) % 24 );
			} else {
				newDate = date.clone().hours( parseInt( hours, 10 ) % 12 );
			}
			this.setState( { date: newDate } );
			const formattedDate = newDate.format( TIMEZONELESS_FORMAT );
			onChange( formattedDate );
		};
	}

	onChangeHours( event ) {
		this.setState( { hours: event.target.value } );
	}

	onChangeMinutes( event ) {
		this.setState( { minutes: event.target.value } );
	}

	render() {
		const { is12Hour } = this.props;
		const { minutes, hours, am } = this.state;

		return (
			<div className="components-time-picker">
				<input
					className="components-time-picker__input"
					type="text"
					value={ hours }
					onChange={ this.onChangeHours }
					onBlur={ this.updateHours }
				/>
				<span className="components-time-picker__separator">:</span>
				<input
					className="components-time-picker__input"
					type="text"
					value={ minutes }
					onChange={ this.onChangeMinutes }
					onBlur={ this.updateMinutes }
				/>
				{ is12Hour && <div>
					<Button
						isDefault
						className="components-time-picker__am-button"
						isToggled={ am === 'AM' }
						onClick={ this.updateAmPm( 'AM' ) }
					>
						{ __( 'AM' ) }
					</Button>
					<Button
						isDefault
						className="components-time-picker__pm-button"
						isToggled={ am === 'PM' }
						onClick={ this.updateAmPm( 'PM' ) }
					>
						{ __( 'PM' ) }
					</Button>
				</div> }
			</div>
		);
	}
}

export default TimePicker;
