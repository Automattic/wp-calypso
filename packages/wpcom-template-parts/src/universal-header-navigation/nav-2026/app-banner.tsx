import clsx from 'clsx';

type LocalizeUrl = (
	fullUrl: string,
	locale?: string,
	isLoggedIn?: boolean,
	useEnglishUrl?: boolean
) => string;

type Translate = ( text: string, domain?: string ) => string;

interface Nav2026AppBannerProps {
	mobilePlatform: 'ios' | 'android' | null;
	tabIndex: number | undefined;
	localizeUrl: LocalizeUrl;
	__: Translate;
}

// "Get Jetpack app" mobile banner (whole banner is the link). `null` off iOS / Android.
export function Nav2026AppBanner( {
	mobilePlatform,
	tabIndex,
	localizeUrl,
	__,
}: Nav2026AppBannerProps ) {
	if ( ! mobilePlatform ) {
		return null;
	}
	return (
		<a
			className={ clsx(
				'x-menu-mobile-app-banner',
				`x-menu-mobile-app-banner--${ mobilePlatform }`
			) }
			href={ localizeUrl( '//apps.wordpress.com/get/?campaign=wpcom-log-out-home-global-nav' ) }
			tabIndex={ tabIndex }
		>
			<span className="x-menu-mobile-app-banner-icons" aria-hidden="true">
				<svg
					className="x-menu-mobile-app-banner-icon x-menu-mobile-app-banner-icon--wp"
					viewBox="0 0 32 32"
					role="presentation"
					focusable="false"
				>
					<circle cx="16" cy="16" r="16" fill="#3858e9" />
					<path
						fill="#fff"
						d="M5.5 16a10.5 10.5 0 0 0 5.92 9.45L6.41 11.7A10.46 10.46 0 0 0 5.5 16Zm17.59-.53c0-1.3-.47-2.2-.87-2.9-.53-.87-1.03-1.6-1.03-2.47 0-.97.73-1.87 1.77-1.87h.14A10.5 10.5 0 0 0 7.93 10.1h.67c1.1 0 2.8-.13 2.8-.13.57-.04.63.8.07.87 0 0-.57.07-1.2.1l3.83 11.4 2.3-6.9-1.64-4.5c-.57-.03-1.1-.1-1.1-.1-.57-.03-.5-.9.06-.87 0 0 1.73.13 2.77.13 1.1 0 2.8-.13 2.8-.13.57-.04.64.8.07.87 0 0-.57.07-1.2.1l3.8 11.31 1.05-3.5c.46-1.46.8-2.5.8-3.4Zm-6.9 1.45-3.16 9.18a10.5 10.5 0 0 0 6.46-.17 1 1 0 0 1-.07-.16l-3.23-8.85Zm8.74-5.76c.04.34.07.7.07 1.1 0 1.07-.2 2.28-.8 3.79l-3.24 9.36A10.5 10.5 0 0 0 24.93 11.16Z"
					/>
				</svg>
				<svg
					className="x-menu-mobile-app-banner-icon x-menu-mobile-app-banner-icon--jetpack"
					viewBox="0 0 32 32"
					role="presentation"
					focusable="false"
				>
					<path
						fill="#069e08"
						d="M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M15,19H7l8-16V19z M17,29V13h8L17,29z"
					/>
				</svg>
			</span>
			<span className="x-menu-mobile-app-banner-text">
				<span className="x-menu-mobile-app-banner-title">
					{ __( 'Get Jetpack app', __i18n_text_domain__ ) }
				</span>
				<span className="x-menu-mobile-app-banner-subtitle">
					{ __( 'Manage your site on mobile', __i18n_text_domain__ ) }
				</span>
			</span>
			<span className="x-menu-mobile-app-banner-download">
				{ mobilePlatform === 'ios' && (
					<svg
						className="x-menu-mobile-app-banner-store-icon x-menu-mobile-app-banner-store-icon--apple"
						viewBox="0 0 16 20"
						role="presentation"
						focusable="false"
						aria-hidden="true"
					>
						<path
							fill="currentColor"
							d="M13.27 10.62c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.3 2-1.4 2.44-.36 6.05 1 8.03.66.97 1.45 2.06 2.49 2.02 1-.04 1.38-.65 2.59-.65 1.21 0 1.55.65 2.6.63 1.07-.02 1.75-.99 2.41-1.96.76-1.12 1.07-2.21 1.09-2.27-.02-.01-2.09-.8-2.11-3.18ZM11.26 4.7c.55-.67.92-1.6.82-2.53-.79.03-1.76.53-2.33 1.2-.51.58-.96 1.53-.84 2.43.88.07 1.79-.45 2.35-1.1Z"
						/>
					</svg>
				) }
				{ mobilePlatform === 'android' && (
					<svg
						className="x-menu-mobile-app-banner-store-icon x-menu-mobile-app-banner-store-icon--google"
						viewBox="0 0 14 16"
						role="presentation"
						focusable="false"
						aria-hidden="true"
					>
						<path
							fill="#EA4335"
							d="M6.53719 7.37598L0.0585938 14.1638C0.322492 15.0975 1.29348 15.6414 2.22719 15.3775C2.36921 15.3372 2.50519 15.2798 2.6321 15.2063L9.92254 11.0544L6.5382 7.37598H6.53719Z"
						/>
						<path
							fill="#FBBC04"
							d="M13.0908 6.222L9.93817 4.41602L6.38965 7.53041L9.95227 11.0447L13.0808 9.25885C13.9198 8.81969 14.2431 7.78424 13.804 6.94521C13.6418 6.63598 13.39 6.38417 13.0808 6.222H13.0908Z"
						/>
						<path
							fill="#4285F4"
							d="M0.0584219 1.28311C0.0191394 1.42816 0 1.57723 0 1.7273V13.7196C0 13.8696 0.0201466 14.0187 0.0584219 14.1638L6.75962 7.54918L0.0584219 1.2821V1.28311Z"
						/>
						<path
							fill="#34A853"
							d="M6.58554 7.72356L9.93563 4.41677L2.65527 0.245774C2.3813 0.0856218 2.07006 5.79087e-06 1.75278 5.79087e-06C0.965112 -0.0020087 0.27213 0.521753 0.0585938 1.2792L6.58554 7.72456V7.72356Z"
						/>
					</svg>
				) }
				<span>{ __( 'Download', __i18n_text_domain__ ) }</span>
			</span>
		</a>
	);
}
