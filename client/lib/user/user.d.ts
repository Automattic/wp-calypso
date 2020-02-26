/**
 * External Dependencies
 */
import { EventEmitter } from 'events';
import { Language } from '../../languages';
import { GravatarOptions } from './gravatar';
import { URL } from '../../types';

/**
 * Takes an optional callback function. If no callback is passed in, it will return a promise.
 **/
export interface RequestHandler {
	( fn: ( err: unknown, res: unknown, headers: unknown ) => unknown ): unknown;
	(): Promise< unknown >;
}

export interface User extends EventEmitter {
	initialize: () => Promise< void >;
	clearStoreIfChanged: () => void;
	get: () => UserData;
	fetch: () => Promise< void >;
	handleFetchFailure: ( error: Error ) => void;
	handleFetchSuccess: ( userdata: UserData ) => void;
	getLanguage: () => Language | void;
	getAvatarUrl: ( options: GravatarOptions ) => URL;
	clear: () => Promise< void > | void;
	sendVerificationEmail: RequestHandler;
	set: ( attributes: UserData ) => boolean;
	decrementSiteCount: () => void;
	incrementSiteCount: () => boolean | void;
	verificationPollerCallback: ( signal: unknown ) => void;
	checkVerification: () => void;
	signalVerification: () => void;
	dispatchToken: string;
}

export type UserData = { ID: number } & Partial< OptionalUserData >;

export type OptionalUserData = {
	abtests: unknown;
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
	meta: unknown;
	newest_note_type: string;
	phone_account: boolean;
	primarySiteSlug: string;
	primary_blog: number;
	primary_blog_is_jetpack: boolean;
	primary_blog_url: string;
	site_count: number;
	social_login_connections: unknown;
	user_ip_country_code: string;
	user_URL: string;
	username: string;
	visible_site_count: number;
};
