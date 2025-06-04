import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useContext, createContext } from '@wordpress/element';
import type { CurrentUser, HelpCenterSite } from '@automattic/data-stores';

export type HelpCenterRequiredInformation = {
	locale: string;
	sectionName: string;
	currentUser: CurrentUser;
	// some users have no sites at all.
	site: HelpCenterSite | null;
	hasPurchases: boolean;
	primarySiteId: number;
	googleMailServiceFamily: string;
	onboardingUrl: string;
	canConnectToZendesk: boolean;
	isLoadingCanConnectToZendesk: boolean;
};

const defaultContext: HelpCenterRequiredInformation = {
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
	isLoadingCanConnectToZendesk: false,
};

const HelpCenterRequiredContext = createContext< HelpCenterRequiredInformation >( defaultContext );

export const HelpCenterRequiredContextProvider: React.FC< {
	children: JSX.Element;
	value: Partial< HelpCenterRequiredInformation > &
		Pick< HelpCenterRequiredInformation, 'currentUser' | 'sectionName' >;
} > = function ( { children, value } ) {
	const { data: canConnectToZendesk, isLoading } = useCanConnectToZendeskMessaging();

	return (
		<HelpCenterRequiredContext.Provider
			value={ {
				...Object.assign( defaultContext, value ),
				isLoadingCanConnectToZendesk: isLoading,
				canConnectToZendesk: canConnectToZendesk ?? false,
			} }
		>
			{ children }
		</HelpCenterRequiredContext.Provider>
	);
};

export function useHelpCenterContext() {
	return useContext( HelpCenterRequiredContext );
}
