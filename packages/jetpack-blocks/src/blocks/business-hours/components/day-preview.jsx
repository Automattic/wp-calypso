/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { date } from '@wordpress/date';
import { isEmpty } from 'lodash';
import { sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { _x } from '../../../utils/i18n';

class DayPreview extends Component {
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
		return (
			<dd key={ key }>
				{ sprintf(
					_x( 'From %s to %s', 'from business opening hour to closing hour' ),
					this.formatTime( interval.opening ),
					this.formatTime( interval.closing )
				) }
			</dd>
		);
	};

	render() {
		const { day, localization } = this.props;
		const hours = day.hours.filter(
			// remove any malformed or empty intervals
			interval => this.formatTime( interval.opening ) && this.formatTime( interval.closing )
		);
		return (
			<Fragment>
				<dt className={ day.name }>{ localization.days[ day.name ] }</dt>
				{ isEmpty( hours ) ? (
					<dd>{ _x( 'Closed', 'business is closed on a full day' ) }</dd>
				) : (
					hours.map( this.renderInterval )
				) }
			</Fragment>
		);
	}
}

export default DayPreview;
