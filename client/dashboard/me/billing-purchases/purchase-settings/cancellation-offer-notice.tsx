import { Purchase } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';
import Notice from '../../../components/notice';
import { isAkismetProduct } from '../../../utils/purchase';

export function CancellationOfferNotice( {
	purchase,
	onClose,
}: {
	purchase: Purchase;
	onClose?: () => void;
} ) {
	const isAkismet = isAkismetProduct( purchase );
	const akismetHeadline = __(
		'We’re happy you’ve chosen Akismet to protect your site against spam.'
	);
	const jetpackHeadline = __( 'We’re happy you’ve chosen Jetpack to level-up your site.' );
	return (
		<Notice variant="success" onClose={ onClose }>
			{
				/* Translators: %(brand)s is either Jetpack or Akismet */
				sprintf( __( 'Thanks for sticking with %(brand)s!' ), {
					brand: isAkismet ? 'Akismet' : 'Jetpack',
				} ) +
					' ' +
					( isAkismet ? akismetHeadline : jetpackHeadline ) +
					' ' +
					sprintf(
						/* Translators: %(percentDiscount)d%% should be a percentage like 15% or 20% */
						__(
							'Your %(percentDiscount)d%% discount for %(productName)s will be applied next time you are billed.'
						),
						{
							percentDiscount: purchase.cancellation_offer_notice_discount_percentage,
							productName: purchase.product_name,
						}
					)
			}
		</Notice>
	);
}
