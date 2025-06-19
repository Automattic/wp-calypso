import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { SupportInteraction, SupportInteractionEvent } from '../types';

export const handleSupportInteractionsFetch = async (
	method: 'GET' | 'POST' | 'PUT',
	path: string | null,
	isTestMode: boolean,
	data?: SupportInteractionEvent | { status: string }
): Promise< SupportInteraction[] > => {
	const fullPath = addQueryArgs( path ?? '', { is_test_mode: isTestMode } );
	return canAccessWpcomApis()
		? await wpcomRequest( {
				method,
				path: `/support-interactions${ fullPath ?? '' }`,
				apiNamespace: 'wpcom/v2',
				body: data,
		  } )
		: await apiFetch( {
				method,
				path: `/help-center/support-interactions${ fullPath ?? '' }`,
				data,
		  } );
};
