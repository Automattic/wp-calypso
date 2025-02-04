export interface TeamMember {
	id: number;
	email: string;
	displayName?: string;
	role?: string;
	avatar?: string;
	dateAdded?: string;
	status: 'active' | 'pending' | 'expired';
}
