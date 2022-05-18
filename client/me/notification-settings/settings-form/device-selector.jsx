import PropTypes from 'prop-types';
import FormSelect from 'calypso/components/forms/form-select';
import { useUserDevicesQuery } from 'calypso/data/user-devices/use-user-devices-query';
import StreamHeader from './stream-header';

function NotificationSettingsFormDeviceSelector( { selectedDeviceId, onChange } ) {
	const { data: devices = [] } = useUserDevicesQuery();

	if ( devices.length === 1 ) {
		return <StreamHeader title={ devices[ 0 ].name } />;
	}

	return (
		<div className="notification-settings-form-header">
			<div className="notification-settings-form-header__title">
				<FormSelect value={ selectedDeviceId } onChange={ onChange }>
					{ devices.map( ( { id, name } ) => (
						<option key={ `device-notifications-${ id }` } value={ id }>
							{ name }
						</option>
					) ) }
				</FormSelect>
			</div>
		</div>
	);
}

NotificationSettingsFormDeviceSelector.propTypes = {
	selectedDeviceId: PropTypes.number.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default NotificationSettingsFormDeviceSelector;
