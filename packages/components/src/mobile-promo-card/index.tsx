import { recordTracksEvent } from '@automattic/calypso-analytics';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import './style.scss';
import iconWoo from './images/icon-woo.png';
import qrCodeJetpack from './images/qr-code-jetpack.png';
import qrCodeWoo from './images/qr-code-woo.png';
import storeBadgeApple from './images/store-apple.png';
import storeBadgeGoogle from './images/store-google.png';
import { WordPressJetpackSVG } from './svg-icons';

export type MobilePromoCardProps = {
	className?: string;
	isWoo?: boolean;
};

// Slugs as used by Jetpack Redirects.
// See https://jetpack.com/redirect for current URLs.
// Two _QRCODE constants are included for reference only.

const URL_JETPACK_A8C = 'calypso-stats-mobile-cta-jetpack-link';
const URL_JETPACK_APPLE = 'calypso-stats-mobile-cta-jetpack-apple-badge';
const URL_JETPACK_GOOGLE = 'calypso-stats-mobile-cta-jetpack-google-badge';
const URL_JETPACK_QRCODE = 'calypso-stats-mobile-cta-jetpack-qrcode';
const URL_WOO_A8C = 'calypso-stats-mobile-cta-woo-link';
const URL_WOO_APPLE = 'calypso-stats-mobile-cta-woo-apple-badge';
const URL_WOO_GOOGLE = 'calypso-stats-mobile-cta-woo-google-badge';
const URL_WOO_QRCODE = 'calypso-stats-mobile-cta-woo-qrcode';

// Named to match getRedirectUrl from '@automattic/jetpack-components'
// which isn't available to us here.
function getRedirectUrlPrivate( slug: string ) {
	// Maps the Jetpack Redirect slugs to URLs.
	const slugs = [
		URL_JETPACK_A8C,
		URL_JETPACK_APPLE,
		URL_JETPACK_GOOGLE,
		URL_JETPACK_QRCODE,
		URL_WOO_A8C,
		URL_WOO_APPLE,
		URL_WOO_GOOGLE,
		URL_WOO_QRCODE,
	];
	// Confirm requested slug is valid.
	const index = slugs.indexOf( slug );
	if ( index === -1 ) {
		return '';
	}
	// Return redirect URL.
	return 'https://jetpack.com/redirect/?source=' + slug;
}

export default function MobilePromoCard( { className, isWoo }: MobilePromoCardProps ) {
	const translate = useTranslate();
	// Basic user agent testing so we can show app store badges on moble.
	const userAgent = window.navigator.userAgent.toLowerCase();
	const isApple = userAgent.includes( 'iphone' ) || userAgent.includes( 'ipad' );
	const isGoogle = userAgent.includes( 'android' );

	const handleClickEvent = ( eventName: string ) => {
		// This is in addition to the default link behaviour so
		// we don't call preventDefault() here.
		recordTracksEvent( eventName );
	};

	// Determines message text based on mobile, tablet, or Desktop.
	const getMessage = () => {
		// The mobile use case. If Apple or Google mobile device, Jetpack or Woo.
		if ( isApple || isGoogle ) {
			return isWoo
				? translate(
						'Check your stats on-the-go and get real-time notifications with the Woo mobile app.'
				  )
				: translate(
						'Check your stats on-the-go and get real-time notifications with the Jetpack mobile app.'
				  );
		}
		// Using useTranslate() with interpolation to set up the linked message.
		// https://wpcalypso.wordpress.com/devdocs/packages/i18n-calypso/README.md
		const redirectLink = isWoo
			? getRedirectUrlPrivate( URL_WOO_A8C )
			: getRedirectUrlPrivate( URL_JETPACK_A8C );
		const linkClassName = isWoo ? 'woo' : 'jetpack';
		const tracksEventName = isWoo
			? 'calypso_stats_mobile_cta_woo_click'
			: 'calypso_stats_mobile_cta_jetpack_click';
		const components = {
			a: (
				<a
					className={ linkClassName }
					href={ redirectLink }
					onClick={ () => handleClickEvent( tracksEventName ) }
				/>
			),
		};
		if ( isWoo ) {
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

	// Returns store badges on mobile (including tablets) and QR codes on the Desktop.
	const getPromoImage = () => {
		if ( isApple ) {
			const appStoreLink = isWoo
				? getRedirectUrlPrivate( URL_WOO_APPLE )
				: getRedirectUrlPrivate( URL_JETPACK_APPLE );
			const tracksEventName = isWoo
				? 'calypso_stats_mobile_cta_woo_apple_click'
				: 'calypso_stats_mobile_cta_jetpack_apple_click';
			return (
				<a href={ appStoreLink } onClick={ () => handleClickEvent( tracksEventName ) }>
					<img
						className="promo-store-badge"
						src={ storeBadgeApple }
						alt="Badge for the Apple App Store"
					/>
				</a>
			);
		}
		if ( isGoogle ) {
			const appStoreLink = isWoo
				? getRedirectUrlPrivate( URL_WOO_GOOGLE )
				: getRedirectUrlPrivate( URL_JETPACK_GOOGLE );
			const tracksEventName = isWoo
				? 'calypso_stats_mobile_cta_woo_google_click'
				: 'calypso_stats_mobile_cta_jetpack_google_click';
			return (
				<a href={ appStoreLink } onClick={ () => handleClickEvent( tracksEventName ) }>
					<img
						className="promo-store-badge"
						src={ storeBadgeGoogle }
						alt="Badge for the Google Play Store"
					/>
				</a>
			);
		}
		if ( isWoo ) {
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
				<p className="promo-card__title">
					{ isWoo
						? translate( 'Bring your Store stats with you using the Woo mobile app' )
						: translate( 'Bring your stats with you using the Jetpack mobile app' ) }
				</p>
				<p className="promo-card__message">{ getMessage() }</p>
			</div>
			<div className="promo-rhs">{ getPromoImage() }</div>
		</div>
	);
}
