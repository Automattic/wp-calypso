import type { ModeType, StepType, StepSlug } from './constants';
import type { ComponentType } from 'react';

// Re-export types from constants for external use
export type { ModeType, StepType, StepSlug } from './constants';

export interface StepDefinition {
	mode: ModeType;
	step: StepType;
	component: ComponentType< StepComponentProps >;
	name?: () => string;
	next?: StepSlug;
	prev?: StepSlug;
	singleColumnLayout?: boolean;
}

export interface StepsDefinition {
	[ key: string ]: StepDefinition;
}

export interface StepComponentProps {
	className?: string;
	domain: string;
	step: StepType;
	mode: ModeType;
	onNextStep: () => void;
	progressStepList: ProgressStepList;
	pageSlug: StepSlug;
	setPage: ( pageSlug: StepSlug ) => void;
	selectedSite?: Site;
	queryError?: string;
	queryErrorDescription?: string;
	verificationInProgress?: boolean;
	verificationStatus?: VerificationStatus;
	domainSetupInfo?: DomainSetupInfo;
	domainSetupInfoError?: Record< string, unknown >;
	showErrors?: boolean;
	onVerifyConnection?: ( setStepAfterVerify?: boolean ) => void;
	isOwnershipVerificationFlow?: boolean;
}

export interface ProgressStepList {
	[ key: string ]: string;
}

export interface Site {
	ID: number;
	slug: string;
	name?: string;
	URL?: string;
}

export interface VerificationStatus {
	data?: {
		status?: string;
		errors?: Array< {
			code: string;
			message: string;
		} >;
	};
	error?: {
		message?: string;
		code?: string;
	};
}

export interface DomainSetupInfo {
	data?: {
		connection_mode?: string;
		domain_connect_apply_wpcom_hosting?: boolean;
		domain_connect_provider_id?: string;
		default_ip_addresses?: string[];
		wpcom_name_servers?: string[];
		is_subdomain?: boolean;
		is_supported_tld?: boolean;
	};
}

export interface DNSRecord {
	type: string;
	name: string;
	value: string;
}

export interface ConnectDomainStepProps {
	domain: string;
	initialStep?: StepSlug;
	showErrors?: boolean;
	isFirstVisit?: boolean;
	queryError?: string;
	queryErrorDescription?: string;
}
