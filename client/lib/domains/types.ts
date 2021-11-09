import { gdprConsentStatus, transferStatus, type as domainType } from './constants';

export type CannotAddEmailReason = {
	code: string | number;
	message: string;
};

export type DomainType = keyof typeof domainType;

interface EmailSubscription {
	ownedByUserId?: number;
	status: string;
}

type EmailCost = {
	amount: number;
	currency: string;
	text: string;
};

export type GDPRConsentStatus = keyof typeof gdprConsentStatus | null;

export type GoogleEmailSubscription = EmailSubscription & {
	pendingTosAcceptance?: boolean;
	pendingUsers?: Array< string >;
	productSlug?: string;
	subscribedDate?: string;
	subscriptionId?: string;
	totalUserCount?: number;
};

export type TitanEmailSubscription = EmailSubscription & {
	expiryDate?: string;
	isEligibleForIntroductoryOffer?: boolean;
	maximumMailboxCount?: number;
	numberOfMailboxes?: number;
	orderId?: number;
	purchaseCostPerMailbox?: EmailCost | null;
	renewalCostPerMailbox?: EmailCost | null;
	subscriptionId?: number | null;
};

export type TransferStatus = keyof typeof transferStatus | null;

export type ResponseDomain = {
	adminEmail: string | null | undefined;
	aRecordsRequiredForMapping?: Array< string >;
	autoRenewalDate: string;
	autoRenewing: boolean;
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
	domain: string;
	domainLockingAvailable: boolean;
	domainRegistrationAgreementUrl: string | null;
	emailForwardsCount: number;
	expired: boolean;
	expiry: string | null;
	expirySoon: boolean;
	gdprConsentStatus: GDPRConsentStatus;
	googleAppsSubscription: GoogleEmailSubscription | null;
	hasRegistration: boolean;
	hasWpcomNameservers: boolean;
	hasZone: boolean;
	isAutoRenewing: boolean;
	isEligibleForInboundTransfer: boolean;
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
	sslStatus: string | null;
	subscriptionId: string | null;
	subdomainPart: string;
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
