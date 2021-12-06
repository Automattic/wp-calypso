import { useTranslate, TranslateResult } from 'i18n-calypso';

/**
 * Returns the appropriate text describing the refund period for the product.
 *
 * @param refundDays The refund period of the product
 * @param productName The name of the product, if available
 * @param translate
 * @returns The refund text to be shown in the cart order summary (translated)
 */
export default function getRefundText(
	refundDays: number,
	productName: string | null,
	translate: ReturnType< typeof useTranslate >
): TranslateResult {
	let refundText: TranslateResult = translate( 'Money back guarantee' );
	if ( refundDays !== 0 ) {
		if ( productName ) {
			// Using plural translation because some languages have multiple plural forms and no plural-agnostic.
			refundText = translate(
				'%(days)d-day money back guarantee for %(product)s',
				'%(days)d-day money back guarantee for %(product)s',
				{
					count: refundDays,
					args: { days: refundDays, product: productName },
				}
			);
		} else {
			refundText = translate(
				'%(days)d-day money back guarantee',
				'%(days)d-day money back guarantee',
				{
					count: refundDays,
					args: { days: refundDays },
				}
			);
		}
	}
	return refundText;
}
