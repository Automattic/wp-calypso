import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { SupportInteractionEvent } from '../types/';

export const handleSupportInteractionsFetch = async (
	method: string,
	path?: string,
	data?: SupportInteractionEvent
) => {
	return canAccessWpcomApis()
		? await wpcomRequest( {
				method,
				path: `/support-interactions${ path ?? '' }`,
				apiNamespace: 'wpcom/v2',
				body: data,
		  } )
		: await apiFetch( {
				method,
				path: `/help-center/support-interactions${ path ?? '' }`,
				data,
		  } );
};
