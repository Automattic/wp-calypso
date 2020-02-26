/**
 * External Dependencies
 */
import { EventEmitter } from 'events';

export interface User extends EventEmitter {
	initialize: () => Promise< void >;
	clearStoreIfChanged: () => void;
	get: () => UserData;
	fetch: () => Promise< void > | boolean;
	handleFetchFailure: ( error: Error ) => void;
	handleFetchSuccess: ( userdata: UserData ) => void;
	getLanguage: () => any | undefined;
	getAvatarUrl: ( options: any ) => string;
	clear: () => Promise< void >;
	sendVerificationEmail: requestHandler;
	set: ( attributes: any ) => boolean;
	decrementSiteCount: () => void;
	incrementSiteCount: () => boolean | void;
	verificationPollerCallback: ( signal: unknown ) => void;
	checkVerification: () => void;
	signalVerification: () => void;
	dispatchToken: string;
}

/**
 * Takes either an optional callback function. If no callback is passed in, it will return a promise.
 * Todo, once types are added for wpcom, move this definition there.
 * packages/wpcom.js/src/lib/util/send-request.js:83
 **/
interface requestHandler {
	( fn: ( err: unknown, res: unknown, headers: unknown ) => unknown ): unknown;
	(): Promise< unknown >;
}

export type UserData = { ID: number } & Partial< OptionalUserData >;

export type OptionalUserData = {
	abtests: any;
	avatar_URL: string;
	date: string;
	description: string;
	display_name: string;
	email: string;
	email_verified: boolean;
	has_unseen_notes: boolean;
	is_new_reader: boolean;
	isRTL: boolean;
	is_valid_google_apps_country: boolean;
	localeSlug: string;
	localeVariant: string;
	logout_URL: string;
	meta: any;
	newest_note_type: string;
	phone_account: boolean;
	primarySiteSlug: string;
	primary_blog: number;
	primary_blog_is_jetpack: boolean;
	primary_blog_url: string;
	site_count: number;
	social_login_connections: any;
	user_ip_country_code: string;
	user_URL: string;
	username: string;
	visible_site_count: number;
};
