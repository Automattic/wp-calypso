export type IpsTag = {
	tag: string;
	registrarName: string;
	registrarUrl: string;
};

export type DomainInboundTransferStatus = {
	creation_date: string;
	admin_email: string;
	in_redemption: boolean;
	registrar: string;
	registrar_iana_id: string;
	privacy: boolean;
	term_maximum_in_years: number;
	transfer_eligible_date: string;
	transfer_restriction_status: string;
	unlocked: boolean | null;
};

export type AuthCodeCheckResult = {
	success: boolean;
	error?: string;
};
