enum ActionType {
	RECEIVE_TEMPLATES = 'RECEIVE_TEMPLATES',
}
export { ActionType };

export interface Template {
	content: string;
	slug: string;
}
