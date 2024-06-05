export interface AgencyDirectoryApplication {
	status: 'pending' | 'in_progress' | 'completed';
	products: string[];
	services: string[];
	directories: DirectoryApplication[];
	feedback_url: string;
}

interface DirectoryApplication {
	directory: 'WordPress' | 'Jetpack' | 'WooCommerce' | 'Pressable';
	published: boolean;
	status: 'pending' | 'approved' | 'rejected' | 'closed';
	urls: string[];
	note: string;
}

export interface AgencyDetails {
	name: string;
	email: string;
	website: string;
	bio_description: string;
	logo_url: string;
	landing_page_url: string;
	country: string;
	is_available: boolean;
	industry: string;
	services: string[];
	products: string[];
	languages_spoken: string[];
	budget_lower_range: number;
}
