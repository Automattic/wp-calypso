import PropTypes from 'prop-types';
import FormSelect from 'calypso/components/forms/form-select';
import { useUserDevicesQuery } from 'calypso/data/user-devices/use-user-devices-query';
import { getLabelForStream } from './locales';

function NotificationSettingsFormStreamSelector( { selectedStream, onChange } ) {
	const { data: devices = [] } = useUserDevicesQuery();

	const options = [ 'timeline', 'email' ]
		.map( ( stream ) => (
			<option key={ stream } value={ stream }>
				{ getLabelForStream( stream ) }
			</option>
		) )
		.concat(
			devices.map( ( device ) => (
				<option key={ device.id } value={ device.id }>
					{ device.name }
				</option>
			) )
		);

	return (
		<div className="notification-settings-form-stream-selector">
			<FormSelect value={ selectedStream } onChange={ ( event ) => onChange( event.target.value ) }>
				{ options }
			</FormSelect>
		</div>
	);
}
NotificationSettingsFormStreamSelector.propTypes = {
	selectedStream: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
	settings: PropTypes.object,
	onChange: PropTypes.func.isRequired,
};

export default NotificationSettingsFormStreamSelector;
