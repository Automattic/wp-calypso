import { ThankYouProps } from 'calypso/components/thank-you/types';

export type DomainThankYouType = 'MAPPING' | 'TRANSFER' | 'MAPPING_WITH_EMAIL';

export type DomainThankYouProps = Required<
	Pick< ThankYouProps, 'thankYouTitle' | 'thankYouSubtitle' | 'sections' | 'thankYouImage' >
> &
	Pick< ThankYouProps, 'thankYouNotice' >;

export type DomainThankYouParams = {
	selectedSiteSlug: string;
	domain: string;
	email?: string;
};

export type DomainThankYouPropsGetter = ( params: DomainThankYouParams ) => DomainThankYouProps;
