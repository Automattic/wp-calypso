import wpcomProxyRequest, {
	type WpcomRequestParams,
	canAccessWpcomApis as originalCanAccessWpcomApis,
} from 'wpcom-proxy-request';

interface WpcomInstance {
	request: typeof wpcomProxyRequest;
}

let wpcomInstance: WpcomInstance | null = null;

export function setWpcomInstance( instance: WpcomInstance ): void {
	wpcomInstance = instance;
}

export default function wpcomRequest< T >( params: WpcomRequestParams ): Promise< T > {
	if ( wpcomInstance ) {
		return wpcomInstance.request( params ) as Promise< T >;
	}
	return wpcomProxyRequest( params );
}

export function canAccessWpcomApis(): boolean {
	if ( wpcomInstance ) {
		return true;
	}
	return originalCanAccessWpcomApis();
}
