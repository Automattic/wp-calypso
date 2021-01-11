export default class InvalidPaymentProcessorResponseError extends Error {
	constructor( paymentProcessorId: string ) {
		const message = `Unknown payment processor response for processor "${ paymentProcessorId }". Payment processor functions should return one of makeManualResponse, makeSuccessResponse, or makeRedirectResponse.`;
		super( message );
		this.name = 'InvalidPaymentProcessorResponseError';
	}
}
