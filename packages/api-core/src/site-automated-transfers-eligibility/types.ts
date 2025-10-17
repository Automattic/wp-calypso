export type AutomatedTransferEligibilityError = {
	code: string;
	message: string;
};

export type AutomatedTransferEligibilityWarning = {
	subdomains: AutomatedTransferEligibilityWarningDomain[];
};

export type AutomatedTransferEligibilityWarningDomainNames = {
	current: string;
	new: string;
};

export type AutomatedTransferEligibilityWarningDomain = {
	id: string;
	description: string;
	domain_names: AutomatedTransferEligibilityWarningDomainNames;
	support_url?: string;
	support_post_id?: number;
};

export type AutomatedTransferEligibility = {
	errors: Array< AutomatedTransferEligibilityError >;
	is_eligible: boolean;
	warnings: AutomatedTransferEligibilityWarning;
};
