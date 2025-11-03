import { ODIE_NEW_INTERACTIONS_BOT_SLUG } from '@automattic/odie-client/src/constants';
import { useContext, createContext } from '@wordpress/element';
import type { CurrentUser, HelpCenterSite } from '@automattic/data-stores';

export type HelpCenterRequiredInformation = {
	newInteractionsBotSlug: string;
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
};

const HelpCenterRequiredContext = createContext< HelpCenterRequiredInformation >( defaultContext );

export const HelpCenterRequiredContextProvider: React.FC< {
	children: JSX.Element;
	value: Partial< HelpCenterRequiredInformation > &
		Pick< HelpCenterRequiredInformation, 'currentUser' | 'sectionName' >;
} > = function ( { children, value } ) {
	return (
		<HelpCenterRequiredContext.Provider
			value={ {
				...Object.assign( defaultContext, value ),
			} }
		>
			{ children }
		</HelpCenterRequiredContext.Provider>
	);
};

export function useHelpCenterContext() {
	return useContext( HelpCenterRequiredContext );
}
