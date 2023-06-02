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

export enum HideCardDuration {
	ONE_WEEK = 'ONE_WEEK',
	ONE_MONTH = 'ONE_MONTH',
}

export enum UpsellCardNoticeType {
	HIDE_CREATE_SITE_CARD = 'upsellCarouselHideCreateSiteCardUntil',
	HIDE_ADD_EMAIL_CARD = 'upsellCarouselHideAddEmailCardUntil',
}
