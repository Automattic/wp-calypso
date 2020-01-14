export const enum ActionType {
	RECEIVE_CURRENT_USER = 'RECEIVE_CURRENT_USER',
	RECEIVE_CURRENT_USER_FAILED = 'RECEIVE_CURRENT_USER_FAILED',
}

export interface CurrentUser {
	ID: number;
	display_name: string;
	username: string;
}
