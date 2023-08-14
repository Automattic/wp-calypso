export interface BasicDomainData {
	domain: string;
	blog_id: number;
	type: 'mapping' | 'wpcom';
	is_wpcom_staging_domain: boolean;
	has_registration: boolean;
	registration_date: string;
	expiry: string;
	wpcom_domain: boolean;
	current_user_is_owner: boolean;
}
