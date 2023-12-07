import { ThankYouProps } from 'calypso/components/thank-you/types';
import { useSiteOption } from 'calypso/state/sites/hooks';

export type DomainThankYouType = 'MAPPING' | 'TRANSFER' | 'REGISTRATION';

export type DomainThankYouProps = Required<
	Pick< ThankYouProps, 'thankYouTitle' | 'thankYouSubtitle' | 'sections' | 'thankYouImage' >
> &
	Pick< ThankYouProps, 'thankYouNotice' >;

export type DomainThankYouParams = {
	domain: string;
	domains: string[];
	email?: string;
	hasProfessionalEmail: boolean;
	hideProfessionalEmailStep: boolean;
	launchpadScreen: ReturnType< typeof useSiteOption >;
	selectedSiteSlug: string;
	selectedSiteId?: number;
	isDomainOnly: boolean;
	siteIntent: ReturnType< typeof useSiteOption >;
	redirectTo: 'home' | 'setup';
	isActivityPubEnabled?: boolean;
};

export type DomainThankYouPropsGetter = ( params: DomainThankYouParams ) => DomainThankYouProps;
