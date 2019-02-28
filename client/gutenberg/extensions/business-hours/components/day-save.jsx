/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { date } from '@wordpress/date';
import { isEmpty } from 'lodash';
import { sprintf } from '@wordpress/i18n';

class DaySave extends Component {
	formatTime( time ) {
		const { timeFormat } = this.props;
		const [ hours, minutes ] = time.split( ':' );
		const _date = new Date();
		if ( ! hours || ! minutes ) {
			return false;
		}
		_date.setHours( hours );
		_date.setMinutes( minutes );
		return date( timeFormat, _date );
	}

	renderInterval = ( interval, key ) => {
		const { intervalText } = this.props;

		return (
			<dd key={ key }>
				{ sprintf(
					intervalText, // 'From %s to %s'
					this.formatTime( interval.opening ),
					this.formatTime( interval.closing )
				) }
			</dd>
		);
	};

	render() {
		const { closedText, day, localization } = this.props;
		const hours = day.hours.filter(
			// remove any malformed or empty intervals
			interval => this.formatTime( interval.opening ) && this.formatTime( interval.closing )
		);
		return (
			<Fragment>
				<dt className={ day.name }>{ localization.days[ day.name ] }</dt>
				{ isEmpty( hours ) ? <dd>{ closedText }</dd> : hours.map( this.renderInterval ) }
			</Fragment>
		);
	}
}

export default DaySave;
