import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

export const EVENT_CONTINUE_BUTTON_CLICK = 'continue_button_click';
export const EVENT_CANCEL_BUTTON_CLICK = 'cancel_button_click';
export const EVENT_ADD_TO_CART_FAILURE = 'add_to_cart_failure';

export type EventName =
	| typeof EVENT_CONTINUE_BUTTON_CLICK
	| typeof EVENT_CANCEL_BUTTON_CLICK
	| typeof EVENT_ADD_TO_CART_FAILURE;

export const getTracksEventName = ( provider: EmailProvider, genericName: EventName ): string => {
	const eventNames = {
		continue_button_click: [
			'calypso_email_management_titan_add_mailboxes_continue_button_click',
			'calypso_email_management_gsuite_add_users_continue_button_click',
		],
		cancel_button_click: [
			'calypso_email_management_titan_add_mailboxes_cancel_button_click',
			'calypso_email_management_gsuite_add_users_cancel_button_click',
		],
		add_to_cart_failure: [
			'calypso_email_management_titan_add_mailboxes_add_to_cart_failure',
			'calypso_email_management_gsuite_add_users_add_to_cart_failure',
		],
	};

	const providerIndex = provider === EmailProvider.Titan ? 0 : 1;
	return eventNames[ genericName ][ providerIndex ];
};
