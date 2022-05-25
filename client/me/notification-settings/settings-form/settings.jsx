import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNotificationDevicesQuery } from 'calypso/data/notification-devices/use-notification-devices-query';
import Labels from './labels';
import Stream from './stream';
import StreamSelector from './stream-selector';

/**
 * Module variables
 */
const streams = {
	TIMELINE: 'timeline',
	EMAIL: 'email',
	DEVICES: 'devices',
};

function NotificationSettingsForm( { blogId, settingKeys, settings, onToggle } ) {
	const [ selectedStream, setSelectedStream ] = useState( streams.TIMELINE );
	const { data: devices = [] } = useNotificationDevicesQuery();

	const getSelectedStreamSettings = () => {
		if ( isNaN( selectedStream ) ) {
			return settings[ selectedStream ];
		}

		return settings.devices?.find( ( { device_id } ) => device_id === parseInt( selectedStream ) );
	};

	const selectedStreamSettings = getSelectedStreamSettings();

	return (
		<div className="notification-settings-form">
			<StreamSelector
				selectedStream={ selectedStream }
				onChange={ setSelectedStream }
				settings={ selectedStreamSettings }
			/>
			<div className="notification-settings-form__streams">
				<Labels settingKeys={ settingKeys } />
				<Stream
					key={ streams.TIMELINE }
					blogId={ blogId }
					stream={ streams.TIMELINE }
					settingKeys={ settingKeys }
					settings={ settings[ streams.TIMELINE ] }
					onToggle={ onToggle }
				/>
				<Stream
					key={ streams.EMAIL }
					blogId={ blogId }
					stream={ streams.EMAIL }
					settingKeys={ settingKeys }
					settings={ settings[ streams.EMAIL ] }
					onToggle={ onToggle }
				/>
				{ devices && devices.length > 0 && (
					<Stream
						key={ streams.DEVICES }
						blogId={ blogId }
						devices={ devices }
						settingKeys={ settingKeys }
						settings={ settings[ streams.DEVICES ] }
						onToggle={ onToggle }
					/>
				) }
				<Stream
					key="selected-stream"
					className="selected-stream"
					blogId={ blogId }
					stream={ selectedStream }
					settingKeys={ settingKeys }
					settings={ selectedStreamSettings }
					onToggle={ onToggle }
				/>
			</div>
		</div>
	);
}

NotificationSettingsForm.propTypes = {
	blogId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
	settingKeys: PropTypes.arrayOf( PropTypes.string ).isRequired,
	settings: PropTypes.object.isRequired,
	onToggle: PropTypes.func.isRequired,
};

export default NotificationSettingsForm;
