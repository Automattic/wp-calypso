/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import FormSelect from 'components/forms/form-select';
import { getLabelForStream } from './locales';
import getUserDevices from 'state/selectors/get-user-devices';

class NotificationSettingsFormStreamSelector extends PureComponent {
	static propTypes = {
		devices: PropTypes.array,
		selectedStream: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
		settings: PropTypes.object,
		onChange: PropTypes.func.isRequired,
	};

	onChange = ( event ) => this.props.onChange( event.target.value );

	render() {
		const options = [ 'timeline', 'email' ]
			.map( ( stream ) => (
				<option key={ stream } value={ stream }>
					{ getLabelForStream( stream ) }
				</option>
			) )
			.concat(
				map( this.props.devices, ( device ) => (
					<option key={ device.id } value={ device.id }>
						{ device.name }
					</option>
				) )
			);

		return (
			<div className="notification-settings-form-stream-selector">
				<FormSelect value={ this.props.selectedStream } onChange={ this.onChange }>
					{ options }
				</FormSelect>
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	devices: getUserDevices( state ),
} ) )( NotificationSettingsFormStreamSelector );
