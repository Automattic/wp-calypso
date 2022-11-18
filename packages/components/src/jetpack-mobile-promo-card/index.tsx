import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import './style.scss';
import qrCodeJetpack from './images/qr-code-jetpack.png';
import qrCodeWoo from './images/qr-code-woo.png';
import { AppStoreSVG, WordPressJetpackSVG } from './svg-icons';

export type JetpackMobilePromoCardProps = {
	className?: string;
	isMobile?: boolean;
	promoType?: string;
};

export default function JetpackMobilePromoCard( {
	className,
	isMobile,
	promoType,
}: JetpackMobilePromoCardProps ) {
	// Using useTranslate() with interpolation to set up the title/message.
	// https://wpcalypso.wordpress.com/devdocs/packages/i18n-calypso/README.md
	const translate = useTranslate();
	const isWoo = promoType === 'woo';
	const redirectLink = isWoo ? 'https://woo.com/mobile/' : 'https://jetpack.com/app/';
	const linkClassName = isWoo ? 'woo' : 'jetpack';
	const components = {
		a: <a className={ linkClassName } href={ redirectLink } />,
	};
	// TODO: Fix mobile logic.
	// Should this maybe come via a media query in the CSS?
	// Also, does it make sense to push one app store over the other?
	// Might make more sense to have a custom "app store" SVG image that goes to wp.com/app.
	const getMessage = () => {
		// Woo strings.
		if ( isWoo ) {
			if ( isMobile ) {
				return translate(
					'Check your stats on-the-go and get real-time notifications with the Woo mobile app.'
				);
			}
			return translate(
				'Visit {{a}}woo.com/mobile{{/a}} or scan the QR code to download the WooCommerce mobile app.',
				{ components }
			);
		}
		// Jetpack strings.
		if ( isMobile ) {
			return translate(
				'Check your stats on-the-go and get real-time notifications with the Jetpack mobile app.'
			);
		}
		return translate(
			'Visit {{a}}jetpack.com/app{{/a}} or scan the QR code to download the Jetpack mobile app.',
			{ components }
		);
	};
	// TODO: Include QR code in bundle?
	// Pulling the QR code from the jetpack.com site for now.
	return (
		<div className={ classNames( 'promo-card', className ?? null ) }>
			<div className="promo-lhs">
				<div className="promo-card__icons">
					<WordPressJetpackSVG />
				</div>
				<p className="promo-card__title">
					{ isWoo &&
						translate( 'Bring your Store stats with you using the {{a}}Woo{{/a}} mobile app', {
							components,
						} ) }
					{ ! isWoo &&
						translate( 'Bring your stats with you using the {{a}}Jetpack{{/a}} mobile app', {
							components,
						} ) }
				</p>
				<p className="promo-card__message">{ getMessage() }</p>
			</div>
			<div className="promo-rhs">
				{ isMobile && <AppStoreSVG /> }
				{ ! isMobile && ! isWoo && (
					<img
						className="promo-qr-code"
						src={ qrCodeJetpack }
						alt="QR Code for Jetpack mobile app"
					/>
				) }
				{ isWoo && (
					<img className="promo-qr-code" src={ qrCodeWoo } alt="QR Code for Woo mobile app" />
				) }
			</div>
		</div>
	);
}
