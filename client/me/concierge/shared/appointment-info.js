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

		const beginTimeFormat = translate( 'LL [at] LT', {
			comment:
				'moment.js formatting string. See http://momentjs.com/docs/#/displaying/format/.' +
				'e.g. Thursday, December 20, 2018 at 8PM.',
		} );

		return (
			<Confirmation
				title={ translate( 'Your upcoming appointment' ) }
				description={ translate(
					"You have a session with us on %(beginTime)s. It'll last about %(duration)d minutes, " +
						'and we can talk about anything related to your site. Get all your questions ready ' +
						'-- we look forward to chatting!',
					{
						args: {
							beginTime: moment( beginTimestamp ).format( beginTimeFormat ),
							duration: moment( endTimestamp ).diff( beginTimestamp, 'minutes' ),
						},
					}
				) }
			/>
		);
	}
}

export default localize( AppointmentInfo );
