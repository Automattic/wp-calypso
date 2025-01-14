import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useContext, createContext } from '@wordpress/element';
import type { CurrentUser, HelpCenterSite } from '@automattic/data-stores';

export type HelpCenterRequiredInformation = {
	locale: string;
	sectionName: string;
	currentUser: CurrentUser;
	// some users have no sites at all.
	site: HelpCenterSite | null;
	hasPurchases: false;
	primarySiteId: number;
	googleMailServiceFamily: string;
	onboardingUrl: string;
	canConnectToZendesk: boolean;
	shouldUseHelpCenterExperience?: boolean;
};

const HelpCenterRequiredContext = createContext< HelpCenterRequiredInformation >( {
	locale: '',
	sectionName: '',
	currentUser: {
		ID: 0,
		display_name: '',
		username: '',
		email: '',
		language: '',
		localeSlug: '',
		locale_variant: '',
		localeVariant: '',
		site_count: 0,
	},
	site: null,
	hasPurchases: false,
	primarySiteId: 0,
	googleMailServiceFamily: '',
	onboardingUrl: '',
	canConnectToZendesk: false,
	shouldUseHelpCenterExperience: false,
} );

export const HelpCenterRequiredContextProvider: React.FC< {
	children: JSX.Element;
	value: HelpCenterRequiredInformation;
} > = function ( { children, value } ) {
	const { data: canConnectToZendesk, isLoading } = useCanConnectToZendeskMessaging();

	return (
		<HelpCenterRequiredContext.Provider
			value={ { ...value, canConnectToZendesk: isLoading ? false : canConnectToZendesk ?? false } }
		>
			{ children }
		</HelpCenterRequiredContext.Provider>
	);
};

export function useHelpCenterContext() {
	return useContext( HelpCenterRequiredContext );
}
