import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import './style.scss';
import iconWoo from './images/icon-woo.png';
import qrCodeJetpack from './images/qr-code-jetpack.png';
import qrCodeWoo from './images/qr-code-woo.png';
import { WordPressJetpackSVG } from './svg-icons';

export type JetpackMobilePromoCardProps = {
	className?: string;
	isWoo?: boolean;
};

export default function JetpackMobilePromoCard( {
	className,
	isWoo,
}: JetpackMobilePromoCardProps ) {
	// Using useTranslate() with interpolation to set up the title/message.
	// https://wpcalypso.wordpress.com/devdocs/packages/i18n-calypso/README.md
	const translate = useTranslate();
	const redirectLink = isWoo ? 'https://woo.com/mobile/' : 'https://jetpack.com/app/';
	const linkClassName = isWoo ? 'woo' : 'jetpack';
	const components = {
		a: <a className={ linkClassName } href={ redirectLink } />,
	};
	return (
		<div className={ classNames( 'promo-card', className ?? null ) }>
			<div className="promo-lhs">
				<div className="promo-card__icons">
					{ isWoo && <img src={ iconWoo } alt="Icon for the Woo mobile app" /> }
					{ ! isWoo && <WordPressJetpackSVG /> }
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
				<p className="promo-card__message">
					{ isWoo &&
						translate(
							'Visit {{a}}woo.com/mobile{{/a}} or scan the QR code to download the WooCommerce mobile app.',
							{ components }
						) }
					{ ! isWoo &&
						translate(
							'Visit {{a}}jetpack.com/app{{/a}} or scan the QR code to download the Jetpack mobile app.',
							{ components }
						) }
				</p>
			</div>
			<div className="promo-rhs">
				{ ! isWoo && (
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
