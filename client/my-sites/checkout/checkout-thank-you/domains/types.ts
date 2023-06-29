import { ThankYouProps } from 'calypso/components/thank-you/types';
import { useSiteOption } from 'calypso/state/sites/hooks';

export type DomainThankYouType = 'MAPPING' | 'TRANSFER' | 'REGISTRATION';

export type DomainThankYouProps = Required<
	Pick< ThankYouProps, 'thankYouTitle' | 'thankYouSubtitle' | 'sections' | 'thankYouImage' >
> &
	Pick< ThankYouProps, 'thankYouNotice' >;

export type DomainThankYouParams = {
	domain: string;
	email?: string;
	hasProfessionalEmail: boolean;
	hideProfessionalEmailStep: boolean;
	launchpadScreen: ReturnType< typeof useSiteOption >;
	selectedSiteSlug: string;
	siteIntent: ReturnType< typeof useSiteOption >;
};

export type DomainThankYouPropsGetter = ( params: DomainThankYouParams ) => DomainThankYouProps;
