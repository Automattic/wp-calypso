/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */

import HoursRow from './HoursRow';
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
		const { hours, edit } = this.props;
		const { localization } = this.state;
		const { startOfWeek } = localization;
		return (
			<dl className={ 'business-hours ' + ( edit ? 'edit' : '' ) }>
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
