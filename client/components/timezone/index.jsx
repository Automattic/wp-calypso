/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { map, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import moment from 'moment-timezone';

/**
 * Internal dependencies
 */
import QueryTimezones from 'components/data/query-timezones';
import getRawOffsets from 'state/selectors/get-raw-offsets';
import getTimezones from 'state/selectors/get-timezones';

function maybeFindLinkedTimezone( incomingTimezone, timezones ) {
	if ( ! timezones ) {
		return incomingTimezone;
	}

	// The (guessed) timezone could not be found, so let's see if a linked timezone for this exists.
	// Example: we don't have Asia/Calcutta but Asia/Kalkota, so we'll need to choose that.
	for ( let i = 0; i < timezones.length; i++ ) {
		// the timezones array is structured by continents.
		const [ , continent_timezones ] = timezones[ i ];
		for ( let j = 0; j < continent_timezones.length; j++ ) {
			// Each timezone has a value and a label.
			const [ timezone ] = continent_timezones[ j ];

			// The exact timezone exists, so return early.
			if ( timezone === incomingTimezone ) {
				return timezone;
			}

			// This uses the internal linking array of moment-timezone since the links are not exposed otherwise.
			const mappedTimezone = moment.tz._links[ timezone.toLowerCase().replace( /\//g, '_' ) ];

			// The incomingTimezone maps to the current one, so this is the one we were looking for.
			if ( mappedTimezone && moment.tz.zone( mappedTimezone ).name === incomingTimezone ) {
				return timezone;
			}
		}
	}

	return incomingTimezone;
}

class Timezone extends Component {
	onSelect = event => {
		this.props.onSelect( maybeFindLinkedTimezone( event.target.value, this.props.timezones ) );
	};

	renderOptionsByContinent() {
		const { timezones } = this.props;

		return map( timezones, timezoneContinent => {
			const [ continent, countries ] = timezoneContinent;

			return (
				<optgroup label={ continent } key={ continent }>
					{ map( countries, ( timezone, index ) => {
						const [ value, label ] = timezone;

						return (
							<option value={ value } key={ index }>
								{ label }
							</option>
						);
					} ) }
				</optgroup>
			);
		} );
	}

	renderManualUtcOffsets() {
		const { rawOffsets, translate } = this.props;

		return (
			<optgroup label={ translate( 'Manual Offsets' ) }>
				{ map( rawOffsets, ( label, value ) => {
					return (
						<option value={ value } key={ value }>
							{ label }
						</option>
					);
				} ) }
			</optgroup>
		);
	}

	render() {
		const { selectedZone, timezones } = this.props;
		return (
			<select
				onChange={ this.onSelect }
				value={ maybeFindLinkedTimezone( selectedZone, timezones ) || '' }
			>
				<QueryTimezones />
				{ this.renderOptionsByContinent() }
				<optgroup label="UTC">
					<option value="UTC">UTC</option>
				</optgroup>
				{ this.props.includeManualOffsets && this.renderManualUtcOffsets() }
			</select>
		);
	}
}

Timezone.defaultProps = {
	onSelect: noop,
	includeManualOffsets: true,
};

Timezone.propTypes = {
	selectedZone: PropTypes.string,
	onSelect: PropTypes.func,
	includeManualOffsets: PropTypes.bool,
};

export default connect( state => ( {
	rawOffsets: getRawOffsets( state ),
	timezones: getTimezones( state ),
} ) )( localize( Timezone ) );
