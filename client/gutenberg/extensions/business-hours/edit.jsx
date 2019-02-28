/**
 * External dependencies
 */
import { BlockIcon } from '@wordpress/editor';
import { Component } from '@wordpress/element';
import { Placeholder } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import classNames from 'classnames';
import { __experimentalGetSettings } from '@wordpress/date';

/**
 * Internal dependencies
 */
import Day from 'gutenberg/extensions/business-hours/components/day';
import DaySave from 'gutenberg/extensions/business-hours/components/day-save';
import { icon } from 'gutenberg/extensions/business-hours/index';
import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

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
const defaultTimeFormat = 'g:i';

class BusinessHours extends Component {
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
		const { attributes, className, isEdit, isSelected } = this.props;
		const { days } = attributes;
		const { localization, hasFetched } = this.state;
		const { startOfWeek } = localization;
		const localizedWeek = days.concat( days.slice( 0, startOfWeek ) ).slice( startOfWeek );

		if ( ! isEdit ) {
			return (
				<dl className={ classNames( className, 'jetpack-business-hours' ) }>
					{ localizedWeek.map( ( day, key ) => {
						return (
							<DaySave
								key={ key }
								day={ day }
								localization={ defaultLocalization }
								timeFormat={ defaultTimeFormat }
								intervalText="From %s to %s"
								closedText="Closed"
							/>
						);
					} ) }
				</dl>
			);
		}

		if ( ! hasFetched ) {
			return (
				<Placeholder
					icon={ <BlockIcon icon={ icon } /> }
					label={ __( 'Loading business hours' ) }
				/>
			);
		}

		if ( ! isSelected ) {
			// Render a preview of the block within the post editor.
			// The preview will be localized.
			const settings = __experimentalGetSettings();
			const {
				formats: { time },
			} = settings;
			return (
				<dl className={ classNames( className, 'jetpack-business-hours' ) }>
					{ localizedWeek.map( ( day, key ) => {
						return (
							<DaySave
								key={ key }
								day={ day }
								localization={ localization }
								timeFormat={ time }
								intervalText={ _x( 'From %s to %s', 'from business opening hour to closing hour' ) }
								closedText={ _x( 'Closed', 'business is closed on a full day' ) }
							/>
						);
					} ) }
				</dl>
			);
		}

		return (
			<div className={ classNames( className, 'is-edit' ) }>
				{ localizedWeek.map( ( day, key ) => {
					return <Day key={ key } day={ day } localization={ localization } { ...this.props } />;
				} ) }
			</div>
		);
	}
}

export default BusinessHours;
