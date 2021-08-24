import { ThankYouProps } from 'calypso/components/thank-you/types';

export type DomainThankYouType = 'MAPPING' | 'TRANSFER';

export type DomainThankYouProps = Required<
	Pick< ThankYouProps, 'thankYouTitle' | 'thankYouSubtitle' | 'sections' | 'thankYouImage' >
> &
	Pick< ThankYouProps, 'thankYouNotice' >;

export type DomainThankYouPropsGetter = (
	selectedSiteSlug: string,
	domainName: string
) => DomainThankYouProps;
