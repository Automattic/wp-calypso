/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize, moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Confirmation from './confirmation';

class AppointmentInfo extends Component {
	static propTypes = {
		appointment: PropTypes.object.isRequired,
	};

	render() {
		const {
			appointment: { beginTimestamp, endTimestamp },
			translate,
		} = this.props;

		return (
			<Confirmation
				title={ translate( 'Your up-coming appointment' ) }
				description={ translate(
					'You have made an appointment with us from %(beginTime)s for %(duration)d minutes. ' +
						'We are looking forward to seeing you there!',
					{
						args: {
							beginTime: moment( beginTimestamp ).format( 'LLLL' ),
							duration: moment( endTimestamp ).diff( beginTimestamp, 'minutes' ),
						},
					}
				) }
			/>
		);
	}
}

export default localize( AppointmentInfo );
