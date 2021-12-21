import {
	enableDomainPrivacy,
	disableDomainPrivacy,
	discloseDomainContactInfo,
	redactDomainContactInfo,
} from 'calypso/state/sites/domains/actions';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

export type ContactsInfoConnectedProps = {
	currentRoute: string;
	isRequestingWhois: boolean;
};

export type ContactsInfoPassedProps = {
	domains: ResponseDomain[];

	selectedDomainName: string;
	selectedSite: SiteData;
};

export type ContactsInfoProps = ContactsInfoPassedProps & ContactsInfoConnectedProps;

export type ContactsCardPassedProps = {
	selectedSite: SiteData;
	selectedDomainName: string;

	privateDomain: boolean;
	privacyAvailable: boolean;
	canManageConsent: boolean;
	contactInfoDisclosureAvailable: boolean;
	contactInfoDisclosed: boolean;
	isPendingIcannVerification: boolean;
};

export type ContactsCardConnectedProps = {
	currentRoute?: string;
	isUpdatingPrivacy: boolean;
};

export type ContactsCardConnectedDispatchProps = {
	enableDomainPrivacy: typeof enableDomainPrivacy;
	disableDomainPrivacy: typeof disableDomainPrivacy;
	discloseDomainContactInfo: typeof discloseDomainContactInfo;
	redactDomainContactInfo: typeof redactDomainContactInfo;
};

export type ContactsCardProps = ContactsCardPassedProps &
	ContactsCardConnectedProps &
	ContactsCardConnectedDispatchProps;
