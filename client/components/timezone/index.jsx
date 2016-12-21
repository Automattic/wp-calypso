/**
 * External Dependencies
 */
import React from 'react';
import map from 'lodash/map';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

/**
 * Module variables
 */
const { Component, PropTypes } = React;
const noop = () => {};
const undocumented = wpcom.undocumented();

class Timezone extends Component {
	constructor() {
		super();

		// bound methods
		this.onSelect = this.onSelect.bind( this );

		this.state = {
			zonesByContinent: [],
			manualUtcOffsets: []
		};
	}

	componentWillMount() {
		undocumented.timezones( ( err, zones ) => {
			if ( err ) {
				return;
			}

			const timezones = {
				zonesByContinent: zones.timezones_by_continent,
				manualUtcOffsets: zones.manual_utc_offsets
			};

			this.setState( timezones );
		} );
	}

	onSelect( event ) {
		this.props.onSelect( event.target.value );
	}

	renderOptionsByContinent() {
		const { zonesByContinent } = this.state;

		return (
			map( zonesByContinent, ( countries, continent ) => {
				return (
					<optgroup label={ continent } key={ continent }>
						{
							map( countries, ( { value, label }, index ) => {
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
		return (
			<optgroup label={ this.props.translate( 'Manual Offsets' ) }>
				{
					map( this.state.manualUtcOffsets, ( { value, label }, index ) => {
						return ( <option value={ value } key={ index }>{ label }</option> );
					} )
				}
			</optgroup>
		);
	}

	render() {
		const { selectedZone } = this.props;
		return (
			<select onChange={ this.onSelect } value={ selectedZone || '' }>
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

export default localize( Timezone );
