import { ODIE_NEW_INTERACTIONS_BOT_SLUG } from '@automattic/odie-client/src/constants';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useContext, createContext } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { CurrentUser, HelpCenterSite } from '@automattic/data-stores';

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
};

const botSlugMap = {
	control: {
		slug: 'wpcom-support-chat',
		version: undefined, // Get active version
	},
	new_workflow: {
		slug: 'wpcom-workflow-support_chat',
		version: undefined, // Get active version
	},
	updated_legacy: {
		slug: 'wpcom-support-chat',
		version: '20.8.2', // Legacy chain assistant with updated prompt
	},
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

function useNewInteractionsBotConfig() {
	const experimentName = 'wpcom_help_center_ai_workflow_and_prompt_changes';
	const query = useQuery( {
		queryKey: [ 'new-interactions-bot-slug', experimentName ],
		staleTime: 10 * 60 * 1000, // 10 minutes
		queryFn: () =>
			canAccessWpcomApis()
				? wpcomRequest< { variations: Record< typeof experimentName, keyof typeof botSlugMap > } >(
						{
							path: '/experiments/0.1.0/assignments/wpcom',
							apiNamespace: 'wpcom/v2',
							query: {
								experiment_name: experimentName,
							},
						}
				  )
				: apiFetch< { variations: Record< typeof experimentName, keyof typeof botSlugMap > } >( {
						path: addQueryArgs( 'jetpack/v4/explat/assignments', {
							experiment_name: experimentName,
							platform: 'wpcom',
							as_connected_user: 'true',
						} ),
				  } ),
	} );

	if ( query.data?.variations && experimentName in query.data.variations ) {
		// null -> control
		const variant = query.data.variations[ experimentName ] ?? 'control';
		const botSlug = botSlugMap[ variant ]?.slug;
		const version = botSlugMap[ variant ]?.version;

		return {
			newInteractionsBotSlug: botSlug,
			newInteractionsBotVersion: version,
		};
	}

	return {};
}

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
