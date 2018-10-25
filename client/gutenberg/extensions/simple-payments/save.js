/** @format */

export default function Save( { attributes } ) {
	const { paymentId } = attributes;
	return paymentId ? `[simple-payment id="${ paymentId }"]` : null;
}
