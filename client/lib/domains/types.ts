import { gdprConsentStatus, transferStatus, type as domainType } from './constants';

export type CannotAddEmailReason = {
	code: string | number;
	message: string;
};

export type DomainType = keyof typeof domainType;

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

export type TransferStatus = keyof typeof transferStatus | null;

export type ResponseDomain = {
	adminEmail: string | null | undefined;
	aRecordsRequiredForMapping?: Array< string >;
	autoRenewalDate: string;
	autoRenewing: boolean;
	aftermarketAuction: boolean;
	beginTransferUntilDate: string;
	blogId: number;
	bundledPlanSubscriptionId: string | number | null | undefined;
	canSetAsPrimary: boolean;
	connectionMode: string;
	contactInfoDisclosed: boolean;
	contactInfoDisclosureAvailable: boolean;
	currentUserCanAddEmail: boolean;
	currentUserCanCreateSiteFromDomainOnly: boolean;
	currentUserCanManage: boolean;
	currentUserCannotAddEmailReason: CannotAddEmailReason | null;
	currentUserIsOwner: boolean;
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
	hasRegistration: boolean;
	hasWpcomNameservers: boolean;
	hasZone: boolean;
	isAutoRenewing: boolean;
	isEligibleForInboundTransfer: boolean;
	isIcannVerificationSuspended: boolean;
	isLocked: boolean;
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
	manualTransferRequired: boolean;
	mustRemovePrivacyBeforeContactUpdate: boolean;
	name: string;
	newRegistration: boolean;
	owner: string;
	partnerDomain: boolean;
	pendingRegistration: boolean;
	pendingRegistrationTime: string;
	pendingTransfer?: boolean;
	pointsToWpcom: boolean;
	privacyAvailable: boolean;
	privateDomain: boolean;
	redeemableUntil: string;
	registrar: string;
	registrationDate: string;
	renewableUntil: string;
	registryExpiryDate: string;
	sslStatus: string | null;
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
