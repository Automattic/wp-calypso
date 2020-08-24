/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { map, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QueryTimezones from 'components/data/query-timezones';
import getRawOffsets from 'state/selectors/get-raw-offsets';
import getTimezones from 'state/selectors/get-timezones';

class Timezone extends Component {
	onSelect = ( event ) => {
		this.props.onSelect( event.target.value );
	};

	renderOptionsByContinent() {
		const { timezones } = this.props;

		return map( timezones, ( timezoneContinent ) => {
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
		const { selectedZone } = this.props;
		return (
			<select onChange={ this.onSelect } value={ selectedZone || '' }>
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

export default connect( ( state ) => ( {
	rawOffsets: getRawOffsets( state ),
	timezones: getTimezones( state ),
} ) )( localize( Timezone ) );
