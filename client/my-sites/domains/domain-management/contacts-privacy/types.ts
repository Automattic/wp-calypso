import {
	enableDomainPrivacy,
	disableDomainPrivacy,
	discloseDomainContactInfo,
	redactDomainContactInfo,
} from 'calypso/state/sites/domains/actions';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

export type ContactsPrivacyInfoConnectedProps = {
	currentRoute: string;
	isRequestingWhois: boolean;
};

export type ContactsPrivacyInfoPassedProps = {
	domains: ResponseDomain[];

	selectedDomainName: string;
	selectedSite: SiteData;
};

export type ContactsPrivacyInfoProps = ContactsPrivacyInfoPassedProps &
	ContactsPrivacyInfoConnectedProps;

export type ContactsPrivacyCardPassedProps = {
	selectedSite: SiteData;
	selectedDomainName: string;

	privateDomain: boolean;
	privacyAvailable: boolean;
	canManageConsent: boolean;
	contactInfoDisclosureAvailable: boolean;
	contactInfoDisclosed: boolean;
	isPendingIcannVerification: boolean;
};

export type ContactsPrivacyCardConnectedProps = {
	currentRoute: string;
	isUpdatingPrivacy: boolean;
};

export type ContactsPrivacyCardConnectedDispatchProps = {
	enableDomainPrivacy: typeof enableDomainPrivacy;
	disableDomainPrivacy: typeof disableDomainPrivacy;
	discloseDomainContactInfo: typeof discloseDomainContactInfo;
	redactDomainContactInfo: typeof redactDomainContactInfo;
};

export type ContactsPrivacyCardProps = ContactsPrivacyCardPassedProps &
	ContactsPrivacyCardConnectedProps &
	ContactsPrivacyCardConnectedDispatchProps;
