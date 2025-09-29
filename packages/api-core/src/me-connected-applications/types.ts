export interface ConnectedApplication {
	ID: string;
	URL: string;
	authorized: string;
	description: string;
	icon: string;
	permissions: {
		description: string;
		name: string;
	}[];
	scope: string;
	site:
		| {
				site_ID: string;
				site_URL: string;
				site_name: string;
		  }
		| boolean;
	title: string;
}

export interface ConnectedApplicationSuccess {
	success: true;
}
