import './style.scss';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import giftingImage from 'calypso/assets/images/gifting/gifting-woman.png';

export function GiftingCheckoutBanner( { siteSlug }: { siteSlug: string } ) {
	const { __ } = useI18n();
	return (
		<div className="gifting-checkout-banner">
			<div>
				<h2>{ __( 'Spread the love!' ) }</h2>
				<p>
					{ sprintf(
						/* translators: %s is the site domain name. */
						__(
							'With this gift, you are helping %s provide the content that you and many others appreciate and enjoy.'
						),
						siteSlug
					) }
				</p>
			</div>
			<img alt="" src={ giftingImage } />
		</div>
	);
}
