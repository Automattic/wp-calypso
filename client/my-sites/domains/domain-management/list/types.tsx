import { ResponseDomain } from 'calypso/lib/domains/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export type DomainOnlyUpsellCarouselOwnProps = {
	domain: ResponseDomain;
};

export type DomainOnlyUpsellCarouselConnectedProps = {
	dispatchRecordTracksEvent: typeof recordTracksEvent;
};

export type DomainOnlyUpsellCarouselProps = DomainOnlyUpsellCarouselOwnProps &
	DomainOnlyUpsellCarouselConnectedProps;
