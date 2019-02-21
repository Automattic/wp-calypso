/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { Placeholder } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import HoursRow from './hours-row';
import { icon } from 'gutenberg/extensions/business-hours';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const defaultLocalization = {
	days: {
		Sun: __( 'Sunday' ),
		Mon: __( 'Monday' ),
		Tue: __( 'Tuesday' ),
		Wed: __( 'Wednesday' ),
		Thu: __( 'Thursday' ),
		Fri: __( 'Friday' ),
		Sat: __( 'Saturday' ),
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
			<div className={ className }>
				{ hasFetched || ! edit ? (
					Object.keys( hours )
						.concat( Object.keys( hours ).slice( 0, startOfWeek ) )
						.slice( startOfWeek )
						.map( ( dayOfTheWeek, index ) => {
							return (
								<HoursRow
									key={ index }
									day={ dayOfTheWeek }
									data={ localization }
									{ ...this.props }
								/>
							);
						} )
				) : (
					<Placeholder icon={ icon } label={ __( 'Loading business hours' ) } />
				) }
			</div>
		);
	}
}

export default HoursList;
