/**
 * External Dependencies
 */
import { EventEmitter } from 'events';
import { Language } from '@automattic/languages';
import { GravatarOptions } from '../../gravatar/types';
import { URL, JSONSerializable } from '../../types';

type WPCOMError = { message: string };
type WPCOMHeaders = { [ name: string ]: string } & { status: number };

type WPCOMCallback = (
	error: WPCOMError | null,
	result: JSONSerializable | null,
	headers: WPCOMHeaders
) => void;

export type UserMetaData = {
	links: Record< 'self' | 'help' | 'site' | 'flags', URL >;
	data?: {
		flags: {
			active_flags: string[];
		};
	};
};

export interface User extends EventEmitter {
	initialize: () => Promise< void >;
	clearStoreIfChanged: ( userId: number ) => void;
	get: () => UserData;
	fetch: () => Promise< void >;
	handleFetchFailure: ( error: Error ) => void;
	handleFetchSuccess: ( userdata: UserData ) => void;
	getLanguage: () => Language | undefined;
	getAvatarUrl: ( options: GravatarOptions ) => URL;
	clear: () => Promise< void > | void;
	sendVerificationEmail< Callback extends WPCOMCallback >( callback: Callback ): XMLHttpRequest;
	sendVerificationEmail(): Promise< void >;
	set: ( attributes: UserData ) => boolean;
	decrementSiteCount: () => void;
	incrementSiteCount: () => void;
	verificationPollerCallback: ( signal?: true ) => void;
	checkVerification: () => void;
	signalVerification: () => void;
	dispatchToken: string;
}

export type UserData = { ID: number } & Partial< OptionalUserData >;

export type OptionalUserData = {
	abtests: Record< string, string >;
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
	meta: UserMetaData;
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
