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

const defaultData = {
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
		data: defaultData,
	};

	componentDidMount() {
		this.apiFetch();
	}

	apiFetch() {
		this.setState( { data: defaultData }, () => {
			apiFetch( { path: '/wpcom/v2/business-hours/localized-week' } ).then(
				data => {
					this.setState( { data } );
				},
				() => {
					this.setState( { data: defaultData } );
				}
			);
		} );
	}

	render() {
		const { hours, edit } = this.props;
		const { data } = this.state;
		const { startOfWeek } = data;
		return (
			<dl className={ 'business-hours ' + ( edit ? 'edit' : '' ) }>
				{ Object.keys( hours )
					.concat( Object.keys( hours ).slice( 0, startOfWeek ) )
					.slice( startOfWeek )
					.map( day => {
						return <HoursRow day={ day } data={ data } { ...this.props } />;
					} ) }
			</dl>
		);
	}
}

export default HoursList;
