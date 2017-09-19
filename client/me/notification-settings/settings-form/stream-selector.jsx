/**
 * External dependencies
 */
import Immutable from 'immutable';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getLabelForStream } from './locales';
import FormSelect from 'components/forms/form-select';
import { getUserDevices } from 'state/selectors';

class NotificationSettingsFormStreamSelector extends PureComponent {
	static propTypes = {
		devices: PropTypes.array,
		selectedStream: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number
		] ).isRequired,
		settings: PropTypes.instanceOf( Immutable.Map ),
		onChange: PropTypes.func.isRequired
	}

	onChange = event => this.props.onChange( event.target.value )

	render() {
		const options = [ 'timeline', 'email' ]
			.map( stream => <option key={ stream } value={ stream }>{ getLabelForStream( stream ) }</option> )
			.concat( map( this.props.devices, device => (
				<option key={ device.id } value={ device.id }>{ device.name }</option>
			) ) );

		return (
			<div className="notification-settings-form-stream-selector">
				<FormSelect
					value={ this.props.selectedStream }
					onChange={ this.onChange } >
					{ options }
				</FormSelect>
			</div>
		);
	}
}

export default connect(
	state => ( {
		devices: getUserDevices( state )
	} )
)( NotificationSettingsFormStreamSelector );
