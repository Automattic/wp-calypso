export interface Service {
	ID: string;
	connect_URL: string;
	description: string;
	external_users_only: boolean;
	genericon: {
		class: string;
		unicode: string;
	};
	icon: string;
	jetpack_module_required: string;
	jetpack_support: boolean;
	label: string;
	multiple_external_user_ID_support: boolean;
	type: string;
}

export interface Connection {
	ID: number;
	site_ID: number;
	user_ID: number;
	keyring_connection_ID: number;
	keyring_connection_user_ID: number;
	shared: boolean;
	service: string;
	label: string;
	issued: string;
	expires: string;
	external_ID: string | null;
	external_name: string | null;
	external_display: string | null;
	external_profile_picture: string | null;
	external_profile_URL: string | null;
	external_follower_count: number | null;
	status: string;
	refresh_URL: string;
	meta: object;
}
