enum ActionType {
	RESET_SITE_TYPE = 'RESET_SITE_TYPE',
	SET_DOMAIN = 'SET_DOMAIN',
	SET_SITE_TITLE = 'SET_SITE_TITLE',
	SET_SITE_TYPE = 'SET_SITE_TYPE',
	SET_SITE_VERTICAL = 'SET_SITE_VERTICAL',
	RESET_SITE_VERTICAL = 'RESET_SITE_VERTICAL',
	SET_TEMPORARY_ACCOUNT = 'SET_TEMPORARY_ACCOUNT',
	SET_TEMPORARY_BLOG = 'SET_TEMPORARY_BLOG',
}
export { ActionType };

export interface SiteVertical {
	label: string;
	id: string;
}

export interface NewUserPostData {
	readonly email: string;
	readonly is_passwordless: boolean;
	readonly validate: false;
	readonly send_verification_email: false;
	readonly send_welcome_email: false;
}

export interface NewSitePostData {
	blog_name: string;
	blog_title?: string;
	public: -1;
	options?: object;
	validate: false;
	find_available_url: true;
}

export interface TemporaryBlog {
	title: string;
	url: string;
	id: number;
}

export interface TemporaryAccount {
	username: string;
	userId: number;
	bearerToken: string;
}
