/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import withMoment from 'components/with-localized-moment';

class FormattedDate extends Component {
	static displayName = "FormattedDate";
	render() {
		let date = this.props.date;
		if ( ! this.props.moment.isMoment( date ) ) {
			// only make a new moment if we were passed something else
			date = this.props.moment( date );
		}
		return <time dateTime={ date.toISOString( true ) }>{ date.format( this.props.format ) }</time>;
	}
}

export default withMoment( FormattedDate );
