import * as React from 'react';
import { useContext } from 'react';
import type { CurrentUser, HelpCenterSite } from '@automattic/data-stores';

export type HelpCenterRequiredInformation = {
	locale: string;
	sectionName: string;
	currentUser: CurrentUser;
	site: HelpCenterSite;
	hasPurchases: false;
	primarySiteId: number;
	googleMailServiceFamily: string;
	onboardingUrl: string;
};

const HelpCenterRequiredContext = React.createContext< HelpCenterRequiredInformation >( {
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
	site: {
		ID: 0,
		URL: '',
		jetpack: false,
		is_wpcom_atomic: false,
		name: '',
		plan: {
			product_slug: '',
		},
		logo: {
			id: 0,
			sizes: [],
			url: '',
		},
		options: {
			launchpad_screen: '',
			site_intent: '',
			admin_url: '',
		},
	},
	hasPurchases: false,
	primarySiteId: 0,
	googleMailServiceFamily: '',
	onboardingUrl: '',
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
