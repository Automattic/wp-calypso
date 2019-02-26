/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import { Component, Fragment } from '@wordpress/element';
import { _x, sprintf } from '@wordpress/i18n';
import { date } from '@wordpress/date';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class DaySave extends Component {
	formatTime( time ) {
		const { timeFormat } = this.props;
		const hoursAndMinutes = time.split( ':' );
		const _date = new Date();
		_date.setHours( hoursAndMinutes[ 0 ] );
		_date.setMinutes( hoursAndMinutes[ 1 ] );
		return date( timeFormat, _date );
	}
	renderInterval = ( interval, key ) => {
		return (
			! isEmpty( interval.opening ) &&
			! isEmpty( interval.closing ) && (
				<dd key={ key }>
					{ sprintf(
						_x( 'From %s to %s', 'from business opening hour to closing hour' ),
						this.formatTime( interval.opening ),
						this.formatTime( interval.closing )
					) }
				</dd>
			)
		);
	};
	render() {
		const { day, localization } = this.props;
		return (
			<Fragment>
				<dt className={ day.name }>{ localization.days[ day.name ] }</dt>
				{ isEmpty( day.hours ) ? (
					<dd>{ __( 'Closed' ) }</dd>
				) : (
					day.hours.map( this.renderInterval )
				) }
			</Fragment>
		);
	}
}

export default DaySave;
