export interface TransferEligibilityError {
	code: string;
	message: string;
}

export interface SubdomainTransferWarning {
	id: string;
	name: string;
	description: string;
}

export interface TransferEligibility {
	errors: TransferEligibilityError[] | [  ];
	is_eligible: boolean;
	warnings: {
		plugins: any[];
		widgets: any[];
		subdomain: SubdomainTransferWarning | [  ];
	};
}

export interface AtomicTransfer {
	atomic_transfer_id: string;
	blog_id: string;
	created_at: string;
	in_lossless_revert: boolean;
	is_stuck: boolean;
	is_stuck_reset: boolean;
	status: string;
}
