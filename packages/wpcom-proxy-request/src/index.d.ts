export interface WpcomClientCredentials {
	client_id: string;
	client_secret: string;
}

export interface WpcomRequestParams {
	path?: string;
	method?: string;
	apiVersion?: string;
	body?: object;
	token?: string;
	metaAPI?: {
		accessAllUsersBlogs?: boolean;
	};
}

export function reloadProxy(): void;

export default function request( params: WpcomRequestParams, callback: Function ): XMLHttpRequest;
export default function request< T >( params: WpcomRequestParams ): Promise< T >;
