import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

export const EVENT_CONTINUE_BUTTON_CLICK = 'continue_button_click';
export const EVENT_CANCEL_BUTTON_CLICK = 'cancel_button_click';

export type EventName = typeof EVENT_CONTINUE_BUTTON_CLICK | typeof EVENT_CANCEL_BUTTON_CLICK;

export const getEventName = ( provider: EmailProvider, genericName: EventName ): string => {
	const providerIndex = provider === EmailProvider.Titan ? 0 : 1;
	const eventNames = {
		continue_button_click: [
			'calypso_email_management_titan_add_mailboxes_continue_button_click',
			'calypso_email_management_gsuite_add_users_continue_button_click',
		],
		cancel_button_click: [
			'calypso_email_management_titan_add_mailboxes_cancel_button_click',
			'calypso_email_management_gsuite_add_users_cancel_button_click',
		],
	};

	return eventNames[ genericName ][ providerIndex ];
};
