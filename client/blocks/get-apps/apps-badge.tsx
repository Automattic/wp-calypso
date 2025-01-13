import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { startsWith } from 'lodash';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './apps-badge.scss';

interface StoreConfig {
	defaultSrc: string;
	src: string;
	tracksEvent: string;
	getStoreLink: ( utm_campaign: string, utm_source?: string, utm_medium?: string ) => string;
	getTitleText: () => string;
	getAltText: () => string;
	getLocaleSlug: () => string;
}

interface AppStoreBadgeUrls {
	ios: StoreConfig;
	android: StoreConfig;
}

// the locale slugs for each stores' image paths follow different rules
// therefore we have to perform some trickery in getLocaleSlug()
const APP_STORE_BADGE_URLS: AppStoreBadgeUrls = {
	ios: {
		defaultSrc: '/calypso/images/me/get-apps-ios-store.svg',
		src: 'https://linkmaker.itunes.apple.com/assets/shared/badges/{localeSlug}/appstore-lrg.svg',
		tracksEvent: 'calypso_app_download_ios_click',
		getStoreLink: ( utm_campaign ) => {
			return `https://apps.apple.com/app/apple-store/id1565481562?pt=299112&ct=${ utm_campaign }&mt=8`;
		},
		getTitleText: () => translate( 'Download the Jetpack iOS mobile app.' ),
		getAltText: () => translate( 'Apple App Store download badge' ),
		getLocaleSlug: function () {
			const localeSlug = getLocaleSlug();
			const localeSlugPrefix = localeSlug.split( '-' )[ 0 ];
			return localeSlugPrefix === 'en' ? 'en-us' : `${ localeSlugPrefix }-${ localeSlugPrefix }`;
		},
	},
	android: {
		defaultSrc: '/calypso/images/me/get-apps-google-play.png',
		src: 'https://play.google.com/intl/en_us/badges/images/generic/{localeSlug}_badge_web_generic.png',
		tracksEvent: 'calypso_app_download_android_click',
		getStoreLink: ( utm_campaign, utm_source = 'calypso', utm_medium = 'web' ) => {
			return `https://play.google.com/store/apps/details?id=com.jetpack.android&referrer=utm_source%3D%${ utm_source }%26utm_medium%3D${ utm_medium }%26utm_campaign%3D${ utm_campaign }`;
		},
		getTitleText: () => translate( 'Download the Jetpack Android mobile app.' ),
		getAltText: () => translate( 'Google Play Store download badge' ),
		getLocaleSlug,
	},
};

interface AppsBadgeProps {
	altText?: string;
	storeLink?: string | null;
	storeName: 'ios' | 'android';
	titleText?: string;
	utm_source: string;
	utm_campaign?: string;
	utm_medium?: string;
	recordTracksEvent: ( event: string, props: { utm_source_string: string } ) => void;
}

interface AppsBadgeState {
	imageSrc: string;
	hasExternalImageLoaded?: boolean;
}

export class AppsBadge extends PureComponent< AppsBadgeProps, AppsBadgeState > {
	static defaultProps = {
		altText: '',
		storeLink: null,
		titleText: '',
	};

	private image: HTMLImageElement | null = null;

	constructor( props: AppsBadgeProps ) {
		super( props );

		const localeSlug = APP_STORE_BADGE_URLS[ props.storeName ].getLocaleSlug().toLowerCase();
		const shouldLoadExternalImage = ! startsWith( localeSlug, 'en' );

		this.state = {
			imageSrc: shouldLoadExternalImage
				? APP_STORE_BADGE_URLS[ props.storeName ].src.replace( '{localeSlug}', localeSlug )
				: APP_STORE_BADGE_URLS[ props.storeName ].defaultSrc,
		};

		if ( shouldLoadExternalImage ) {
			this.image = null;
			this.loadImage();
		}
	}

	loadImage(): void {
		this.image = new globalThis.Image();
		this.image.src = this.state.imageSrc;
		this.image.onload = this.onLoadImageComplete;
		this.image.onerror = this.onLoadImageError;
	}

	onLoadImageComplete = (): void => {
		this.setState( {
			hasExternalImageLoaded: true,
		} );
	};

	onLoadImageError = (): void => {
		this.setState( {
			hasExternalImageLoaded: false,
			imageSrc: APP_STORE_BADGE_URLS[ this.props.storeName ].defaultSrc,
		} );
	};

	onLinkClick = (): void => {
		const { storeName, utm_source } = this.props;
		this.props.recordTracksEvent( APP_STORE_BADGE_URLS[ storeName ].tracksEvent, {
			utm_source_string: utm_source,
		} );
	};

	render() {
		const { altText, titleText, storeLink, storeName, utm_source, utm_medium, utm_campaign } =
			this.props;
		const { imageSrc, hasExternalImageLoaded } = this.state;

		const figureClassNames = clsx( 'get-apps__app-badge', {
			[ `${ storeName }-app-badge` ]: true,
			'is-external-image': hasExternalImageLoaded,
		} );

		const badge = APP_STORE_BADGE_URLS[ storeName ];

		return (
			<figure className={ figureClassNames }>
				<a
					href={
						storeLink ? storeLink : badge.getStoreLink( utm_campaign!, utm_source, utm_medium )
					}
					onClick={ this.onLinkClick }
					target="_blank"
					rel="noopener noreferrer"
				>
					<img
						src={ imageSrc }
						title={ titleText ? titleText : badge.getTitleText() }
						alt={ altText ? altText : badge.getAltText() }
					/>
				</a>
			</figure>
		);
	}
}

export default connect( null, {
	recordTracksEvent,
} )( AppsBadge );
