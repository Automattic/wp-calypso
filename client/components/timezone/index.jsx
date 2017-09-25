/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { map, noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryTimezones from 'components/data/query-timezones';
import { getRawOffsets, getTimezones } from 'state/selectors';

class Timezone extends Component {
	onSelect = ( event ) => {
		this.props.onSelect( event.target.value );
	}

	renderOptionsByContinent() {
		const { timezones } = this.props;

		return (
			map( timezones, ( timezoneContinent ) => {
				const [ continent, countries ] = timezoneContinent;

				return (
					<optgroup label={ continent } key={ continent }>
						{
							map( countries, ( timezone, index ) => {
								const [ value, label ] = timezone;

								return (
									<option value={ value } key={ index }>{ label }</option>
								);
							} )
						}
					</optgroup>
				);
			} )
		);
	}

	renderManualUtcOffsets() {
		const { rawOffsets, translate } = this.props;

		return (
			<optgroup label={ translate( 'Manual Offsets' ) }>
				{
					map( rawOffsets, ( label, value ) => {
						return ( <option value={ value } key={ value }>{ label }</option> );
					} )
				}
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
				{ this.renderManualUtcOffsets() }
			</select>
		);
	}
}

Timezone.defaultProps = {
	onSelect: noop
};

Timezone.propTypes = {
	selectedZone: PropTypes.string,
	onSelect: PropTypes.func
};

export default connect(
	( state ) => ( {
		rawOffsets: getRawOffsets( state ),
		timezones: getTimezones( state ),
	} )
)( localize( Timezone ) );
