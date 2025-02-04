/**
 *  Helper to support nock reply responses using the correct envelope format.
 *  Requests with envelope http_envelope=1 require a specific response format.
 *  @example
 *  const installationWithSuccess = replyWithEnvelope( 200 );
 *  const installationWithError = replyWithEnvelope( 400, { error: 'any error' } );
 *
 *  nock(...).reply(installationWithSuccess() );
 *  nock(...).reply(installationWithError({error: 'any other error'}) );
 */
export const replyWithEnvelope =
	( status: number, defaultBody: Record< string, string | number > = {} ) =>
	( body = {} ) =>
	() => [ status, { code: status, ...defaultBody, ...body } ];

export const replyErrorWithEnvelope =
	( status: number, defaultBody: Record< string, string | number > = {} ) =>
	( body = {} ) =>
	() => [ 200, { code: status, body: { ...defaultBody, ...body } } ];

export const replyWithSuccess = replyWithEnvelope( 200 );
export const replyWithError = replyErrorWithEnvelope( 400, { error: 'any error' } );
