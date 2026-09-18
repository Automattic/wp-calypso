export interface LegacyContact {
	legacy_contact_id: number;
	contact_email: string;
	notes?: string;
	created_at: string;
}

export interface LegacyContactWithAccessKey extends LegacyContact {
	access_key: string;
}
