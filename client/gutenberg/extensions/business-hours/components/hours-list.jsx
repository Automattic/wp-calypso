/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */

import HoursRow from './hours-row';
import apiFetch from '@wordpress/api-fetch/build/index';

const defaultLocalization = {
	days: {
		Sun: 'Sunday',
		Mon: 'Monday',
		Tue: 'Tuesday',
		Wed: 'Wednesday',
		Thu: 'Thursday',
		Fri: 'Friday',
		Sat: 'Saturday',
	},
	startOfWeek: 0,
};

class HoursList extends Component {
	state = {
		localization: defaultLocalization,
	};

	componentDidMount() {
		this.apiFetch();
	}

	apiFetch() {
		this.setState( { data: defaultLocalization }, () => {
			apiFetch( { path: '/wpcom/v2/business-hours/localized-week' } ).then(
				data => {
					this.setState( { localization: data } );
				},
				() => {
					this.setState( { localization: defaultLocalization } );
				}
			);
		} );
	}

	render() {
		const { className, attributes } = this.props;
		const { hours } = attributes;
		const { localization } = this.state;
		const { startOfWeek } = localization;
		return (
			<dl className={ className }>
				{ Object.keys( hours )
					.concat( Object.keys( hours ).slice( 0, startOfWeek ) )
					.slice( startOfWeek )
					.map( dayOfTheWeek => {
						return <HoursRow day={ dayOfTheWeek } data={ localization } { ...this.props } />;
					} ) }
			</dl>
		);
	}
}

export default HoursList;
