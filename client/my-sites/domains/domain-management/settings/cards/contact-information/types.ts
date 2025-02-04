import {
	enableDomainPrivacy,
	disableDomainPrivacy,
	discloseDomainContactInfo,
	redactDomainContactInfo,
} from 'calypso/state/sites/domains/actions';
import type { SiteDetails } from '@automattic/data-stores';
import type { ResponseDomain } from 'calypso/lib/domains/types';

export type ContactsInfoConnectedProps = {
	currentRoute: string;
	isRequestingWhois: boolean;
};

export type ContactsInfoPassedProps = {
	domains: ResponseDomain[];

	selectedDomainName: string;
	selectedSite: SiteDetails;
};

export type ContactsInfoProps = ContactsInfoPassedProps & ContactsInfoConnectedProps;

export type ContactsCardPassedProps = {
	selectedSite: SiteDetails;
	selectedDomainName: string;

	privateDomain: boolean;
	privacyAvailable: boolean;
	canManageConsent: boolean;
	contactInfoDisclosureAvailable: boolean;
	contactInfoDisclosed: boolean;
	hasPendingContactUpdate: boolean;
	isPendingIcannVerification: boolean;
	readOnly: boolean | undefined;
	registeredViaTrustee: boolean;
	registeredViaTrusteeUrl: string;
	isHundredYearDomain: boolean;
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
