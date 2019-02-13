/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { Placeholder } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch/build/index';

/**
 * Internal dependencies
 */
import HoursRow from './hours-row';
import { icon } from 'gutenberg/extensions/business-hours';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

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
		hasFetched: false,
	};

	componentDidMount() {
		this.apiFetch();
	}

	apiFetch() {
		this.setState( { data: defaultLocalization }, () => {
			apiFetch( { path: '/wpcom/v2/business-hours/localized-week' } ).then(
				data => {
					this.setState( { localization: data, hasFetched: true } );
				},
				() => {
					this.setState( { localization: defaultLocalization, hasFetched: true } );
				}
			);
		} );
	}

	render() {
		const { className, attributes, edit } = this.props;
		const { hours } = attributes;
		const { localization, hasFetched } = this.state;
		const { startOfWeek } = localization;
		return (
			<dl className={ className }>
				{ hasFetched || ! edit ? (
					Object.keys( hours )
						.concat( Object.keys( hours ).slice( 0, startOfWeek ) )
						.slice( startOfWeek )
						.map( dayOfTheWeek => {
							return <HoursRow day={ dayOfTheWeek } data={ localization } { ...this.props } />;
						} )
				) : (
					<Placeholder icon={ icon } label={ __( 'Loading business hours' ) } />
				) }
			</dl>
		);
	}
}

export default HoursList;
