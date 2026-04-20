import wpcomProxyRequest, {
	type WpcomRequestParams,
	canAccessWpcomApis as originalCanAccessWpcomApis,
} from 'wpcom-proxy-request';

type WpcomRequester = < T >( params: WpcomRequestParams ) => Promise< T >;

let customRequester: WpcomRequester | null = null;

export function setRequester( requester: WpcomRequester ): void {
	customRequester = requester;
}

export default function wpcomRequest< T >( params: WpcomRequestParams ): Promise< T > {
	if ( customRequester ) {
		return customRequester( params );
	}
	return wpcomProxyRequest( params );
}

export function canAccessWpcomApis(): boolean {
	if ( customRequester ) {
		return true;
	}
	return originalCanAccessWpcomApis();
}
