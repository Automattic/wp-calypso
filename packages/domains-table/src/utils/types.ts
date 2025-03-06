import { gdprConsentStatus, transferStatus, type as domainType } from './constants';

export type CannotAddEmailReason = {
	code: string | number;
	message: string;
};

export type DomainType = ( typeof domainType )[ keyof typeof domainType ];

interface EmailSubscription {
	expiryDate?: string;
	hasExpectedDnsRecords?: boolean | null;
	isEligibleForIntroductoryOffer?: boolean;
	ownedByUserId?: number;
	purchaseCostPerMailbox?: EmailCost | null;
	renewalCostPerMailbox?: EmailCost | null;
	status?: string;
}

export type EmailCost = {
	amount: number;
	currency: string;
	text: string;
};

export type GDPRConsentStatus = keyof typeof gdprConsentStatus | null;

export type GoogleEmailSubscription = EmailSubscription & {
	expiryDate?: string;
	pendingTosAcceptance?: boolean;
	productSlug?: string;
	subscribedDate?: string;
	subscriptionId?: string;
	totalUserCount?: number;
};

export type TitanEmailSubscription = EmailSubscription & {
	appsUrl?: string;
	maximumMailboxCount?: number;
	numberOfMailboxes?: number;
	orderId?: number;
	productSlug?: string;
	subscriptionId?: number | null;
};

export type TransferStatus = ( typeof transferStatus )[ keyof typeof transferStatus ];

export type DnssecRecords = {
	dnskey?: string;
	dsData?: Array< string >;
};

export type ResponseDomain = {
	adminEmail: string | null | undefined;
	aftermarketAuction: boolean;
	aftermarketAuctionEnd: string | null;
	aftermarketAuctionStart: string | null;
	aRecordsRequiredForMapping?: Array< string >;
	authCodeRequired: boolean;
	autoRenewalDate: string;
	autoRenewing: boolean;
	beginTransferUntilDate: string;
	blogId: number;
	bundledPlanSubscriptionId: string | number | null | undefined;
	canManageDnsRecords: boolean;
	canManageNameServers: boolean;
	canTransferToOtherSite: boolean;
	canTransferToAnyUser: boolean;
	cannotManageDnsRecordsReason: string | null;
	cannotManageNameServersReason: string | null;
	cannotUpdateContactInfoReason: string | null;
	canSetAsPrimary: boolean;
	canUpdateContactInfo: boolean;
	connectionMode: string;
	contactInfoDisclosed: boolean;
	contactInfoDisclosureAvailable: boolean;
	currentUserCanAddEmail: boolean;
	currentUserCanCreateSiteFromDomainOnly: boolean;
	currentUserCanManage: boolean;
	currentUserCannotAddEmailReason: CannotAddEmailReason | null;
	currentUserIsOwner: boolean;
	dnssecRecords?: DnssecRecords;
	domain: string;
	domainLockingAvailable: boolean;
	domainRegistrationAgreementUrl: string | null;
	emailForwardsCount: number;
	expired: boolean;
	expiry: string | null;
	expirySoon: boolean;
	gdprConsentStatus: GDPRConsentStatus;
	googleAppsSubscription: GoogleEmailSubscription | null;
	hasEmailForwardsDnsRecords?: boolean | null;
	hasPendingContactUpdate: boolean;
	hasRegistration: boolean;
	hasWpcomNameservers: boolean;
	hasZone: boolean;
	isAutoRenewing: boolean;
	isEligibleForInboundTransfer: boolean;
	isDnssecEnabled: boolean;
	isDnssecSupported: boolean;
	isGravatarDomain: boolean;
	isGravatarRestrictedDomain: boolean;
	isHundredYearDomain: boolean;
	isIcannVerificationSuspended: boolean | null;
	isLocked: boolean;
	isMappedToAtomicSite: boolean;
	isMoveToNewSitePending: boolean;
	isPendingIcannVerification: boolean;
	isPendingRenewal: boolean;
	isPendingWhoisUpdate: boolean;
	isPremium: boolean;
	isPrimary: boolean;
	isRedeemable: boolean;
	isRenewable: boolean;
	isSubdomain: boolean;
	isWPCOMDomain: boolean;
	isWpcomStagingDomain: boolean;
	lastTransferError?: string | null;
	manualTransferRequired: boolean;
	mustRemovePrivacyBeforeContactUpdate: boolean;
	name: string;
	nominetDomainSuspended: boolean;
	nominetPendingContactVerificationRequest: boolean;
	owner: string;
	partnerDomain: boolean;
	pendingRegistration: boolean;
	pendingRegistrationAtRegistry: boolean;
	pendingRegistrationAtRegistryUrl: string;
	pendingTransfer?: boolean;
	pointsToWpcom: boolean;
	privacyAvailable: boolean;
	privateDomain: boolean;
	redeemableUntil: string;
	registeredViaTrustee: boolean;
	registeredViaTrusteeUrl: string;
	registrar: string;
	registrationDate: string;
	registryExpiryDate: string;
	renewableUntil: string;
	sslStatus: 'active' | 'pending' | 'newly_registered' | 'disabled' | null;
	subdomainPart?: string;
	subscriptionId: string | null;
	supportsDomainConnect: boolean;
	supportsGdprConsentManagement: boolean;
	supportsTransferApproval: boolean;
	titanMailSubscription: TitanEmailSubscription | null;
	tldMaintenanceEndTime?: number;
	transferAwayEligibleAt: string | null;
	transferEndDate: string | null;
	transferLockOnWhoisUpdateOptional: boolean;
	transferStartDate: string | null;
	transferStatus: TransferStatus;
	type: DomainType;
	whoisUpdateUnmodifiableFields?: Array< string >;
};

export type DnsRecordType = 'MX' | 'A' | 'SRV' | 'TXT' | 'AAAA' | 'CNAME' | 'NS';

export type DnsRecord = {
	domain: string;
	id: string;
	name: string;
	protected_field: boolean;
	type: DnsRecordType;
	target?: string;
	data?: string;
	weight?: number;
	port?: number;
	aux?: number;
	service?: string;
	protocol?: string;
};

export type DnsRequest = {
	hasLoadedFromServer: boolean;
	isFetching: boolean;
	isSubmittingForm: boolean;
	records: Array< DnsRecord >;
};

export type DomainsApiError = {
	error?: string;
	message?: string;
};

export type GetDomainNoticesResponseDataSuccess = {
	success: boolean;
	states: {
		[ domainName: string ]: {
			[ domainNotice: string ]: string;
		};
	};
};

export type SetDomainNoticeResponseDataSuccess = {
	success: boolean;
	states: {
		[ domainName: string ]: {
			[ domainNotice: string ]: string;
		};
	};
};
