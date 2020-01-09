export const enum ActionType {
	RECEIVE_USER = 'RECEIVE_USER',
}

export interface User {
	ID: number;
	display_name: string;
	username: string;
}
