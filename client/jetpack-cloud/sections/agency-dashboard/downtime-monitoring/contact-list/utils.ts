import {
	AllowedMonitorContactActions,
	AllowedMonitorContactTypes,
	StateMonitorSettingsEmail,
	StateMonitorSettingsSMS,
	StateMonitoringSettingsContact,
} from '../../sites-overview/types';

export const getContactItemValue = (
	type: AllowedMonitorContactTypes,
	item: StateMonitoringSettingsContact
) => {
	if ( type === 'email' ) {
		return ( item as StateMonitorSettingsEmail ).email;
	}

	if ( type === 'sms' ) {
		return ( item as StateMonitorSettingsSMS ).phoneNumberFull;
	}

	return null;
};

export const getContactActionEventName = (
	type: AllowedMonitorContactTypes,
	action: AllowedMonitorContactActions
) => {
	const EVENT_NAMES = {
		email: {
			add: 'downtime_monitoring_email_address_add_click',
			edit: 'downtime_monitoring_email_address_edit_click',
			remove: 'downtime_monitoring_email_address_remove_click',
			verify: 'downtime_monitoring_email_address_verify_click',
		},
		sms: {
			add: 'downtime_monitoring_phone_number_add_click',
			edit: 'downtime_monitoring_phone_number_edit_click',
			remove: 'downtime_monitoring_phone_number_remove_click',
			verify: 'downtime_monitoring_phone_number_verify_click',
		},
	};

	return EVENT_NAMES[ type as keyof typeof EVENT_NAMES ]?.[ action ];
};
