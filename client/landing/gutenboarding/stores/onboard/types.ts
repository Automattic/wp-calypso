enum ActionType {
	RESET_SITE_TYPE = 'RESET_SITE_TYPE',
	SET_DOMAIN = 'SET_DOMAIN',
	SET_SITE_TITLE = 'SET_SITE_TITLE',
	SET_SITE_TYPE = 'SET_SITE_TYPE',
	SET_SITE_VERTICAL = 'SET_SITE_VERTICAL',
	RESET_SITE_VERTICAL = 'RESET_SITE_VERTICAL',
}
export { ActionType };

export interface SiteVertical {
	label: string;
	id: string;
}
