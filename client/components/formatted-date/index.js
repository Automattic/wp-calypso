/** @format */
/**
 * External dependencies
 *
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import withMoment from 'components/with-localized-moment';
import toCurrentLocale from './to-current-locale';

class FormattedDate extends Component {
	static displayName = 'FormattedDate';
	render() {
		let date = this.props.date;
		const moment = this.props.moment;
		if ( ! moment.isMoment( date ) ) {
			// only make a new moment if we were passed something else
			date = moment( date );
		} else {
			// make sure the date is in the current locale
			date = toCurrentLocale( date );
		}
		return <time dateTime={ date.toISOString( true ) }>{ date.format( this.props.format ) }</time>;
	}
}

export default withMoment( FormattedDate );
