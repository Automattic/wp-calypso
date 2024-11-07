import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { SupportInteraction, SupportInteractionEvent } from '../types';

export const handleSupportInteractionsFetch = async (
	method: 'GET' | 'POST' | 'PUT',
	path: string | null,
	data?: SupportInteractionEvent | { status: string }
): Promise< SupportInteraction[] > => {
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
