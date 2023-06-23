import {
	AllowedMonitorContactActions,
	AllowedMonitorContactTypes,
	StateMonitorSettingsEmail,
	StateMonitorSettingsSMS,
} from '../../sites-overview/types';

export const getContactItemValue = (
	type: AllowedMonitorContactTypes,
	item: StateMonitorSettingsEmail | StateMonitorSettingsSMS
) => {
	if ( type === 'email' ) {
		return ( item as StateMonitorSettingsEmail ).email;
	}
	return ( item as StateMonitorSettingsSMS ).phoneNumberFull;
};

export const getContactActionEventName = (
	type: AllowedMonitorContactTypes,
	action: AllowedMonitorContactActions
) => {
	const EVENT_NAMES =
		type === 'email'
			? {
					add: 'downtime_monitoring_email_address_add_click',
					edit: 'downtime_monitoring_email_address_edit_click',
					remove: 'downtime_monitoring_email_address_remove_click',
					verify: 'downtime_monitoring_email_address_verify_click',
			  }
			: {
					add: 'downtime_monitoring_sms_number_add_click',
					edit: 'downtime_monitoring_sms_number_edit_click',
					remove: 'downtime_monitoring_sms_number_remove_click',
					verify: 'downtime_monitoring_sms_number_verify_click',
			  };

	return EVENT_NAMES[ action as keyof typeof EVENT_NAMES ];
};
