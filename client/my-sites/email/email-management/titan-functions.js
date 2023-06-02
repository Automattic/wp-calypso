import wpcom from 'calypso/lib/wp';

export const fetchTitanAutoLoginURL = ( emailAccountId, context ) => {
	const encEmailAccountId = encodeURIComponent( emailAccountId );
	return wpcom.req
		.get(
			{
				path: `/emails/titan/${ encEmailAccountId }/control-panel-auto-login-url`,
				apiNamespace: 'wpcom/v2',
			},
			{ context }
		)
		.then( ( result ) => ( {
			error: null,
			loginURL: result.auto_login_url,
		} ) )
		.catch( ( serverError ) => ( {
			error: serverError.message,
			loginURL: null,
		} ) );
};

export const fetchTitanIframeURL = ( emailAccountId, context ) => {
	const encEmailAccountId = encodeURIComponent( emailAccountId );
	return wpcom.req
		.get(
			{
				path: `/emails/titan/${ encEmailAccountId }/control-panel-iframe-url`,
				apiNamespace: 'wpcom/v2',
			},
			{ context }
		)
		.then( ( result ) => ( {
			error: null,
			iframeURL: result.iframe_url,
		} ) )
		.catch( ( serverError ) => ( {
			error: serverError.message,
			iframeURL: null,
		} ) );
};
