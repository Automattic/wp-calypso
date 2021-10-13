import { SiteData } from 'calypso/state/ui/selectors/site-data';
import { stepSlug, useMyDomainInputMode } from '../constants';

type ValueOf< T > = T[ keyof T ];
type Maybe< T > = T | null;

type PossibleSlugs = ValueOf< typeof stepSlug >;
type PossibleInitialModes = ValueOf< typeof useMyDomainInputMode >;

export type AuthCodeValidationError = {
	error?: string;
	message?: string;
};

export type AuthCodeValidationData = {
	domain: string;
	selectedSite: Maybe< SiteData >;
	verificationData: {
		ownership_verification_data: {
			verification_type: 'auth_code';
			verification_data: string;
		};
	};
};

export type AuthCodeValidationHandler = (
	authData: AuthCodeValidationData,
	onDone?: ( error?: Maybe< AuthCodeValidationError >, callbackData?: unknown ) => void
) => unknown;

export type InboundTransferStatusInfo = {
	creationDate: string;
	email: string;
	inRedemption: boolean;
	losingRegistrar: boolean;
	privacy: boolean;
	termMaximumInYears: number;
	transferEligibleDate: string;
	transferRestrictionStatus: string;
	unlocked: boolean;
};

export type StartStepProps = {
	domain: string;
	className: string;
	pageSlug: PossibleSlugs;
	onNextStep: () => void;
	stepContent: JSX.Element;
	progressStepList: Record< PossibleSlugs, string >;
	domainInboundTransferStatusInfo: Partial< InboundTransferStatusInfo >;
	initialMode: PossibleInitialModes;
	setPage: ( page: PossibleSlugs ) => void;
};

export type DomainStepAuthCodeProps = {
	authCodeDescription: JSX.Element;
	buttonMessage: string;
	className: string;
	domain: string;
	customHeading?: string;
	onBeforeValidate: () => void;
	validateHandler: AuthCodeValidationHandler;
	pageSlug: PossibleSlugs;
	progressStepList: Record< PossibleSlugs, string >;
	selectedSite: Maybe< SiteData >;
};
