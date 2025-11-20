export type PropagationStatusArea = {
	area_code: string;
	area_name: string;
	propagated: boolean;
};

export type DomainPropagationStatus = {
	propagation_status: PropagationStatusArea[];
	last_updated: string;
};
