import { useLocalizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import QRCode from 'qrcode.react';
import './style.scss';
import iconWoo from './images/icon-woo.png';
import qrCodeWoo from './images/qr-code-woo.png';
import storeBadgeApple from './images/store-apple.png';
import storeBadgeGoogle from './images/store-google.png';
import { WordPressJetpackSVG } from './svg-icons';

// Slugs as used by Jetpack Redirects.
// See https://jetpack.com/redirect for current URLs.
// Two _QRCode constants are included for reference only.
const REDIRECT_SLUGS: {
	[ key: string ]: string | undefined;
} = {
	jetpackApple: 'calypso-stats-mobile-cta-jetpack-apple-badge',
	jetpackGoogle: 'calypso-stats-mobile-cta-jetpack-google-badge',
	wooA8C: 'calypso-stats-mobile-cta-woo-link',
	wooApple: 'calypso-stats-mobile-cta-woo-apple-badge',
	wooGoogle: 'calypso-stats-mobile-cta-woo-google-badge',
	wooQRCode: 'calypso-stats-mobile-cta-woo-qrcode',
};

// Generate a Jetpack Redirect URL based on the provided slug.
// Similar to getRedirectUrl from '@automattic/jetpack-components'.
function getRedirectUrl( key: string ): string | null {
	// Confirm requested slug is valid.
	if ( ! REDIRECT_SLUGS.hasOwnProperty( key ) ) {
		return null;
	}
	// Return redirect URL.
	return 'https://jetpack.com/redirect/?source=' + REDIRECT_SLUGS[ key ];
}

// For relaying click events to the caller.
const CLICK_EVENTS = {
	jetpackClickA8C: 'jetpack-click-a8c',
	jetpackClickApple: 'jetpack-click-apple',
	jetpackClickGoogle: 'jetpack-click-google',
	wooClickA8C: 'woo-click-a8c',
	wooClickApple: 'woo-click-apple',
	wooClickGoogle: 'woo-click-google',
};

export type AppPromoCardProps = {
	className?: string;
	isWoo?: boolean;
	clickHandler?: ( eventName: string ) => void;
};

export function AppPromoCard( { className, isWoo, clickHandler }: AppPromoCardProps ) {
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	// Basic user agent testing so we can show app store badges on moble.
	const userAgent = window.navigator.userAgent.toLowerCase();
	const isApple = userAgent.includes( 'iphone' ) || userAgent.includes( 'ipad' );
	const isGoogle = userAgent.includes( 'android' );

	const onClickHandler = ( eventName: string ) => {
		clickHandler?.( eventName );
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
		if ( isWoo ) {
			return translate(
				'Visit {{a}}woo.com/mobile{{/a}} or scan the QR code to download the WooCommerce mobile app.',
				{
					components: {
						a: (
							<a
								className="app-promo-card__link app-promo-card__woo-link"
								href={ getRedirectUrl( 'wooA8C' ) ?? 'https://woo.com/mobile' }
								onClick={ () => onClickHandler( CLICK_EVENTS.wooClickA8C ) }
							/>
						),
					},
				}
			);
		}
		return translate(
			'Visit {{a}}wp.com/app{{/a}} or scan the QR code to download the Jetpack mobile app.',
			{
				components: {
					a: (
						<a
							className="app-promo-card__link app-promo-card__jetpack-link"
							href={ localizeUrl( 'https://apps.wordpress.com/get/?campaign=calypso-stats-promo' ) }
							onClick={ () => onClickHandler( CLICK_EVENTS.jetpackClickA8C ) }
						/>
					),
				},
			}
		);
	};

	// Returns store badges on mobile (including tablets) and QR codes on the Desktop.
	const getPromoImage = () => {
		const fallbackLink = isWoo ? 'https://woo.com/mobile' : 'https://wp.com/app';
		if ( isApple ) {
			const appStoreLink = isWoo ? getRedirectUrl( 'wooApple' ) : getRedirectUrl( 'jetpackApple' );
			const tracksEventName = isWoo ? CLICK_EVENTS.wooClickApple : CLICK_EVENTS.jetpackClickApple;
			return (
				<a
					href={ appStoreLink ?? fallbackLink }
					onClick={ () => onClickHandler( tracksEventName ) }
				>
					<img
						className="app-promo-card__store-badge"
						src={ storeBadgeApple }
						alt="Badge for the Apple App Store"
					/>
				</a>
			);
		}
		if ( isGoogle ) {
			const appStoreLink = isWoo
				? getRedirectUrl( 'wooGoogle' )
				: getRedirectUrl( 'jetpackGoogle' );
			const tracksEventName = isWoo ? CLICK_EVENTS.wooClickGoogle : CLICK_EVENTS.jetpackClickGoogle;
			return (
				<a
					href={ appStoreLink ?? fallbackLink }
					onClick={ () => onClickHandler( tracksEventName ) }
				>
					<img
						className="app-promo-card__store-badge"
						src={ storeBadgeGoogle }
						alt="Badge for the Google Play Store"
					/>
				</a>
			);
		}
		return isWoo ? (
			<img className="app-promo-card__qr-code" src={ qrCodeWoo } alt="QR Code for Woo mobile app" />
		) : (
			<QRCode
				className="app-promo-card__qr-code"
				value={ localizeUrl( 'https://apps.wordpress.com/get/?campaign=calypso-qrcode-apps' ) }
				size={ 300 }
			/>
		);
	};

	return (
		<div className={ clsx( 'app-promo-card', className ?? null ) }>
			<div className="app-promo-card__lhs">
				<div className="app-promo-card__icons">
					{ isWoo && (
						<img
							className="app-promo-card__woo-icon"
							src={ iconWoo }
							alt="Icon for the Woo mobile app"
						/>
					) }
					{ ! isWoo && <WordPressJetpackSVG /> }
				</div>
				<p className="app-promo-card__title">
					{ isWoo
						? translate( 'Bring your Store stats with you using the Woo mobile app' )
						: translate( 'Bring your stats with you using the Jetpack mobile app' ) }
				</p>
				<p className="app-promo-card__message">{ getMessage() }</p>
			</div>
			<div className="app-promo-card__rhs">{ getPromoImage() }</div>
		</div>
	);
}
