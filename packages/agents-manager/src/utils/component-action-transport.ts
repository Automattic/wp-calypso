import { API_BASE_URL } from '../constants';
import type { AgentConfig } from './create-agent-config';
import type { ComponentActionRequest } from '@automattic/agent-components';

export async function executeComponentAction(
	config: AgentConfig,
	input: ComponentActionRequest,
	isCurrent: () => boolean = () => true
): Promise< unknown > {
	const headers = await config.authProvider?.();
	if ( ! isCurrent() ) {
		throw new Error( 'This action is no longer available.' );
	}
	const authorization = headers?.Authorization;
	if ( ! authorization ) {
		throw new Error( 'Your session expired. Refresh the page to continue.' );
	}
	const token = authorization.replace( /^Bearer\s+/i, '' );
	const isJwt = token.split( '.' ).length === 3;
	const siteId = config.authenticationScope?.siteId;
	if ( ! isJwt && ( ! siteId || ! Number.isSafeInteger( siteId ) || siteId < 1 ) ) {
		throw new Error( 'Select a supported site before proposing this action.' );
	}
	const route = isJwt
		? '/wp/v2/abilities/wpcom/component-action/run'
		: `/wp/v2/sites/${ siteId }/wp-abilities/v1/abilities/wpcom/component-action/run`;
	const response = await fetch( `${ API_BASE_URL }${ route }`, {
		method: 'POST',
		headers: isJwt
			? { 'Content-Type': 'application/json' }
			: { ...headers, 'Content-Type': 'application/json' },
		body: JSON.stringify( isJwt ? { token, input } : { input } ),
	} );
	if ( ! response.ok ) {
		throw new Error( 'The action could not be confirmed. Refresh the page to continue.' );
	}
	return response.json();
}
