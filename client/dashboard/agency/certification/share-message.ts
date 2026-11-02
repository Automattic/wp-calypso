import { __, sprintf } from '@wordpress/i18n';
import { CERTIFICATION_EXAM_URL } from './constants';

/**
 * Plain text an owner pastes into a chat or email, so developers who don't use
 * the dashboard get the code, the discount and the exam link in one place.
 */
export function getCertificationShareMessage( {
	code,
	discount,
	isPromo,
	promoLastDay,
}: {
	code: string;
	discount: number;
	isPromo: boolean;
	promoLastDay: string;
} ) {
	const offer = isPromo
		? sprintf(
				/* translators: %1$d is a percentage discount, %2$s is a date, e.g. March 31, 2027 */
				__(
					'We get %1$d%% off the Advanced Professional WordPress Developer exam through Automattic for Agencies, double our usual discount until %2$s.'
				),
				discount,
				promoLastDay
			)
		: sprintf(
				/* translators: %d is a percentage discount */
				__(
					'We get %d%% off the Advanced Professional WordPress Developer exam through Automattic for Agencies.'
				),
				discount
			);

	return [
		offer,
		'',
		/* translators: %s is the agency's discount code */
		sprintf( __( 'Discount code: %s' ), code ),
		/* translators: %s is the exam's web address */
		sprintf( __( 'Sign up for the exam: %s' ), CERTIFICATION_EXAM_URL ),
		'',
		__(
			'Enter the code when you buy the exam on Webassessor. Our agency can use it up to 20 times per year, once per developer.'
		),
	].join( '\n' );
}
