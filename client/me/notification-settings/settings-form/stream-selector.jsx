import PropTypes from 'prop-types';
import FormSelect from 'calypso/components/forms/form-select';
import { useNotificationDevicesQuery } from 'calypso/data/notification-devices/use-notification-devices-query';
import { getLabelForStream } from './locales';

const options = [ 'timeline', 'email' ];

function NotificationSettingsFormStreamSelector( { selectedStream, onChange } ) {
	const { data: devices = [] } = useNotificationDevicesQuery();

	options
		.map( ( stream ) => (
			<option key={ `device-notifications-${ stream }` } value={ stream }>
				{ getLabelForStream( stream ) }
			</option>
		) )
		.concat(
			devices.map( ( device ) => (
				<option key={ `device-notifications-${ device.id }` } value={ device.id }>
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
