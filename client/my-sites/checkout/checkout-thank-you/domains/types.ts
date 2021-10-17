import { ThankYouProps } from 'calypso/components/thank-you/types';

export type DomainThankYouType = 'MAPPING' | 'TRANSFER' | 'REGISTRATION';

export type DomainThankYouProps = Required<
	Pick< ThankYouProps, 'thankYouTitle' | 'thankYouSubtitle' | 'sections' | 'thankYouImage' >
> &
	Pick< ThankYouProps, 'thankYouNotice' >;

export type DomainThankYouParams = {
	domain: string;
	email?: string;
	hasProfessionalEmail: boolean;
	selectedSiteSlug: string;
};

export type DomainThankYouPropsGetter = ( params: DomainThankYouParams ) => DomainThankYouProps;
