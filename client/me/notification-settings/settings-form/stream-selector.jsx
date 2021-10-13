import { map } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import FormSelect from 'calypso/components/forms/form-select';
import getUserDevices from 'calypso/state/selectors/get-user-devices';
import { getLabelForStream } from './locales';

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
