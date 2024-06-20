import * as React from 'react';
import { useContext } from 'react';

export type HelpCenterRequiredInformation = {
	locale: string;
	sectionName: string;
	currentUserId: number;
	selectedSiteId: number;
	hasPurchases: boolean;
	primarySiteId: number;
	getGoogleMailServiceFamily: string;
	avatarUrl: string | undefined;
	userEmail: string;
	isBusinessOrEcomPlanUser?: boolean;
	onboardingUrl: string;
	displayName: string;
	isJetpackSite: boolean;
	adminUrl: string;
};

const HelpCenterRequiredContext = React.createContext< HelpCenterRequiredInformation >( {
	locale: '',
	sectionName: '',
	currentUserId: 0,
	selectedSiteId: 0,
	hasPurchases: false,
	primarySiteId: 0,
	userEmail: '',
	displayName: '',
	avatarUrl: undefined,
	isBusinessOrEcomPlanUser: false,
	getGoogleMailServiceFamily: '',
	onboardingUrl: '',
	isJetpackSite: false,
	adminUrl: '',
} );

export const HelpCenterRequiredContextProvider: React.FC< {
	children: JSX.Element;
	value: HelpCenterRequiredInformation;
} > = function ( { children, value } ) {
	return (
		<HelpCenterRequiredContext.Provider value={ value }>
			{ children }
		</HelpCenterRequiredContext.Provider>
	);
};

export function useHelpCenterContext() {
	return useContext( HelpCenterRequiredContext );
}
