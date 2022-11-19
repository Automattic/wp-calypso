import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { HAS_SEEN_PREF_KEY } from './constants';
import type { Dispatch, APIFetchOptions } from './types';

export const getHasSeenPromotionalPopover =
	() =>
	async ( { dispatch }: Dispatch ) => {
		const response = canAccessWpcomApis()
			? await wpcomRequest< boolean >( {
					path: `me/preferences?preference_key=${ HAS_SEEN_PREF_KEY }`,
					apiNamespace: 'wpcom/v2/',
					apiVersion: '2',
			  } )
			: await apiFetch< boolean >( {
					global: true,
					path: '/help-center/has-seen-promotion',
			  } as APIFetchOptions );

		dispatch.receiveHasSeenPromotionalPopover( response );
	};
