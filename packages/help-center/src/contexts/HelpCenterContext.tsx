import { ODIE_NEW_INTERACTIONS_BOT_SLUG } from '@automattic/odie-client/src/constants';
import { useContext, createContext } from '@wordpress/element';
import { useNewInteractionsBotConfig } from '../hooks/use-new-interaction-bot-config';
import type { CurrentUser, HelpCenterSite } from '@automattic/data-stores';

/**
 * Local copies of the Agents Manager extension types.
 * Keep in sync with `@automattic/agents-manager/src/extension-types.ts`.
 */
export interface ToolProvider {
	getAbilities: () => Promise< Ability[] >;
	executeAbility: ( name: string, args: any ) => Promise< any >;
}

export interface Ability {
	name: string;
	label: string;
	description: string;
	category: string;
	input_schema?: Record< string, any >;
	output_schema?: Record< string, any >;
	callback?: ( input: any ) => any | Promise< any >;
	permissionCallback?: ( input?: any ) => boolean | Promise< boolean >;
	meta?: {
		annotations?: {
			readonly?: boolean | null;
			destructive?: boolean | null;
			idempotent?: boolean | null;
		};
		[ key: string ]: any;
	};
}

export interface ContextProvider {
	getClientContext: () => ClientContextType;
}

export interface ClientContextType {
	url: string;
	pathname: string;
	search: string;
	environment: 'wp-admin' | 'ciab-admin' | 'calypso' | string;
	contextEntries?: ContextEntry[];
	[ key: string ]: any;
}

export interface BaseContextEntry {
	id: string;
	type: string;
	getData?: () => any;
	data?: any;
}

export type ContextEntry = BaseContextEntry;

export type Suggestion = {
	id: string;
	title: string;
	description?: string;
	prompt: string;
};

export type HelpCenterRequiredInformation = {
	newInteractionsBotSlug: string;
	newInteractionsBotVersion?: string;
	locale: string;
	sectionName: string;
	currentUser: CurrentUser;
	// some users have no sites at all.
	site: HelpCenterSite | null;
	hasPurchases: boolean;
	primarySiteId: number;
	googleMailServiceFamily: string;
	onboardingUrl: string;
	isCommerceGarden: boolean;
	source: '' | 'wpcom' | 'a4a';
	// This is specific to A4A
	agency: {
		id: number;
		pressableId?: number;
	} | null;
};

const defaultContext: HelpCenterRequiredInformation = {
	newInteractionsBotSlug: ODIE_NEW_INTERACTIONS_BOT_SLUG,
	locale: '',
	sectionName: '',
	currentUser: {
		ID: 0,
		abtests: {},
		atomic_site_count: 0,
		atomic_visible_site_count: 0,
		date: '',
		display_name: '',
		email: '',
		email_verified: false,
		had_hosting_trial: false,
		has_unseen_notes: false,
		i18n_empathy_mode: false,
		is_subscription_only: false,
		is_valid_google_apps_country: false,
		language: '',
		lasagna_jwt: '',
		locale_variant: '',
		logout_URL: '',
		meta: {
			links: {},
			data: {},
		},
		newest_note_type: '',
		phone_account: false,
		primary_blog: 0,
		primary_blog_is_jetpack: false,
		primary_blog_url: '',
		profile_URL: '',
		site_count: 0,
		social_login_connections: [],
		use_fallback_for_incomplete_languages: false,
		user_ip_country_code: '',
		username: '',
		verified: false,
		visible_site_count: 0,
	},
	site: null,
	hasPurchases: false,
	primarySiteId: 0,
	googleMailServiceFamily: '',
	onboardingUrl: '',
	isCommerceGarden: false,
	source: 'wpcom',
	agency: null,
};

const HelpCenterRequiredContext = createContext< HelpCenterRequiredInformation >( defaultContext );

export const HelpCenterRequiredContextProvider: React.FC< {
	children: JSX.Element;
	value: Partial< HelpCenterRequiredInformation > &
		Pick< HelpCenterRequiredInformation, 'currentUser' | 'sectionName' >;
} > = function ( { children, value } ) {
	const botConfig = useNewInteractionsBotConfig();

	return (
		<HelpCenterRequiredContext.Provider
			value={ {
				...Object.assign( {}, defaultContext, botConfig, value ),
			} }
		>
			{ children }
		</HelpCenterRequiredContext.Provider>
	);
};

export function useHelpCenterContext() {
	return useContext( HelpCenterRequiredContext );
}
