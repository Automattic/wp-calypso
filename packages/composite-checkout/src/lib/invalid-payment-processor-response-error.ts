export default class InvalidPaymentProcessorResponseError extends Error {
	constructor( paymentProcessorId: string ) {
		const message = `Unknown payment processor response for processor "${ paymentProcessorId }". Payment processor functions should return one of makeSuccessResponse, makeRedirectResponse, or makeErrorResponse.`;
		super( message );
		this.name = 'InvalidPaymentProcessorResponseError';
	}
}
