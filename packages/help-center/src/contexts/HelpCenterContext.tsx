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
	isCommerceGarden: boolean;
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
