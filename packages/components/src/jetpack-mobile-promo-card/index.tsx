import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import './style.scss';
import iconWoo from './images/icon-woo.png';
import qrCodeJetpack from './images/qr-code-jetpack.png';
import qrCodeWoo from './images/qr-code-woo.png';
import storeBadgeApple from './images/store-apple.png';
import storeBadgeGoogle from './images/store-google.png';
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
	const userAgent = window.navigator.userAgent.toLowerCase();
	const isApple = userAgent.includes( 'iphone' ) || userAgent.includes( 'ipad' );
	const isGoogle = userAgent.includes( 'android' );
	let appStoreLink = '#';
	if ( isApple ) {
		if ( isWoo ) {
			appStoreLink = 'https://apps.apple.com/ca/app/woocommerce/id1389130815';
		} else {
			appStoreLink = 'https://apps.apple.com/ca/app/jetpack-website-builder/id1565481562';
		}
	} else if ( isGoogle ) {
		if ( isWoo ) {
			appStoreLink = 'https://play.google.com/store/apps/details?id=com.woocommerce.android';
		} else {
			appStoreLink = 'https://play.google.com/store/apps/details?id=com.jetpack.android';
		}
	}

	const getTitle = () => {
		if ( isWoo ) {
			return translate( 'Bring your Store stats with you using the {{a}}Woo{{/a}} mobile app', {
				components,
			} );
		}
		return translate( 'Bring your stats with you using the {{a}}Jetpack{{/a}} mobile app', {
			components,
		} );
	};

	const getMessage = () => {
		// Determines message text based on mobile, tablet, or Desktop.
		if ( isApple ) {
			return translate(
				'Check your stats on-the-go and get real-time notifications with the Jetpack mobile app.'
			);
		} else if ( isGoogle ) {
			return translate(
				'Check your stats on-the-go and get real-time notifications with the Woo mobile app.'
			);
		} else if ( isWoo ) {
			return translate(
				'Visit {{a}}woo.com/mobile{{/a}} or scan the QR code to download the WooCommerce mobile app.',
				{ components }
			);
		}
		return translate(
			'Visit {{a}}jetpack.com/app{{/a}} or scan the QR code to download the Jetpack mobile app.',
			{ components }
		);
	};

	const getPromoImage = () => {
		// Returns store badges on mobile (including tablets) and QR codes on the Desktop.
		if ( isApple ) {
			return (
				<a href={ appStoreLink }>
					<img
						className="promo-store-badge"
						src={ storeBadgeApple }
						alt="Badge for the Apple App Store"
					/>
				</a>
			);
		} else if ( isGoogle ) {
			return (
				<a href={ appStoreLink }>
					<img
						className="promo-store-badge"
						src={ storeBadgeGoogle }
						alt="Badge for the Google Play Store"
					/>
				</a>
			);
		} else if ( isWoo ) {
			return <img className="promo-qr-code" src={ qrCodeWoo } alt="QR Code for Woo mobile app" />;
		}
		return (
			<img className="promo-qr-code" src={ qrCodeJetpack } alt="QR Code for Jetpack mobile app" />
		);
	};

	return (
		<div className={ classNames( 'promo-card', className ?? null ) }>
			<div className="promo-lhs">
				<div className="promo-card__icons">
					{ isWoo && <img src={ iconWoo } alt="Icon for the Woo mobile app" /> }
					{ ! isWoo && <WordPressJetpackSVG /> }
				</div>
				<p className="promo-card__title">{ getTitle() }</p>
				<p className="promo-card__message">{ getMessage() }</p>
			</div>
			<div className="promo-rhs">{ getPromoImage() }</div>
		</div>
	);
}
