import { ResponseDomain } from 'calypso/lib/domains/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestDomainsNotices, updateDomainNotice } from 'calypso/state/domains/notices/actions';

export type DomainOnlyUpsellCarouselOwnProps = {
	domain: ResponseDomain;
};

export type DomainOnlyUpsellCarouselConnectedProps = {
	dispatchRecordTracksEvent: typeof recordTracksEvent;
	requestDomainsNotices: typeof requestDomainsNotices;
	updateDomainNotice: typeof updateDomainNotice;
};

export type DomainOnlyUpsellCarouselStateProps = {
	hideAddEmailCard?: null | string;
	hideCreateSiteCard?: null | string;
	isRequestingDomainNotices: boolean;
	isUpdatingDomainNotices: boolean;
};

export type DomainOnlyUpsellCarouselProps = DomainOnlyUpsellCarouselOwnProps &
	DomainOnlyUpsellCarouselConnectedProps &
	DomainOnlyUpsellCarouselStateProps;

export enum HideCardDuration {
	ONE_WEEK = 'ONE_WEEK',
	ONE_MONTH = 'ONE_MONTH',
}

export type UpsellCardNoticeType =
	| 'upsellCarouselHideCreateSiteCardUntil'
	| 'upsellCarouselHideAddEmailCardUntil';
