/**
 * External Dependencies
 */
import { EventEmitter } from 'events';

export class User extends EventEmitter {
	initialize: () => Promise< void >;
	clearStoreIfChanged: () => void;
	get: () => UserData;
	fetch: () => Promise< void >;
	handleFetchFailure: () => void;
	handleFetchSuccess: () => void;
	getLanguage: () => string;
	getAvatarUrl: () => string;
	clear: () => void;
	sendVerificationEmail: () => Promise< void >;
	set: () => boolean;
	decrementSiteCount: () => void;
	incrementSiteCount: () => void;
	verificationPollerCallback: () => void;
	checkVerification: () => void;
	signalVerification: () => void;
	dispatchToken: () => void;
}

export class UserData {
	ID: string;
	display_name?: string;
	username?: string;
	avatar_URL?: string;
	site_count?: string;
	visible_site_count?: string;
	date?: string;
	has_unseen_notes?: string;
	newest_note_type?: string;
	phone_account?: string;
	email?: string;
	email_verified?: string;
	is_valid_google_apps_country?: string;
	user_ip_country_code?: string;
	logout_URL?: string;
	primary_blog?: string;
	primary_blog_is_jetpack?: string;
	primary_blog_url?: string;
	meta?: string;
	is_new_reader?: string;
	social_login_connections?: string;
	abtests?: string;
	description?: string;
	user_URL?: string;
	primarySiteSlug?: string;
	localeSlug?: string;
	localeVariant?: string;
	isRTL?: string;
}
