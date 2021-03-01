/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { startsWith } from 'lodash';
import { translate } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import TranslatableString from 'calypso/components/translatable/proptype';

/**
 * Style dependencies
 */
import './apps-badge.scss';

// the locale slugs for each stores' image paths follow different rules
// therefore we have to perform some trickery in getLocaleSlug()
const APP_STORE_BADGE_URLS = {
	ios: {
		defaultSrc: '/calypso/images/me/get-apps-ios-store.svg',
		src: 'https://linkmaker.itunes.apple.com/assets/shared/badges/{localeSlug}/appstore-lrg.svg',
		tracksEvent: 'calypso_app_download_ios_click',
		getStoreLink: ( utm_source ) =>
			`https://apps.apple.com/app/apple-store/id335703880?pt=299112&ct=${ utm_source }&mt=8`,
		getTitleText: () => translate( 'Download the WordPress iOS mobile app.' ),
		getAltText: () => translate( 'Apple App Store download badge' ),
		getLocaleSlug: function () {
			const localeSlug = getLocaleSlug();
			const localeSlugPrefix = localeSlug.split( '-' )[ 0 ];
			return localeSlugPrefix === 'en' ? 'en-us' : `${ localeSlugPrefix }-${ localeSlugPrefix }`;
		},
	},
	android: {
		defaultSrc: '/calypso/images/me/get-apps-google-play.png',
		src:
			'https://play.google.com/intl/en_us/badges/images/generic/{localeSlug}_badge_web_generic.png',
		tracksEvent: 'calypso_app_download_android_click',
		getStoreLink: (
			utm_source,
			utm_medium = 'web',
			utm_campaign = 'mobile-download-promo-pages'
		) =>
			`https://play.google.com/store/apps/details?id=org.wordpress.android&referrer=utm_source%3D%${ utm_source }%26utm_medium%3D${ utm_medium }%26utm_campaign%3D${ utm_campaign }`,
		getTitleText: () => translate( 'Download the WordPress Android mobile app.' ),
		getAltText: () => translate( 'Google Play Store download badge' ),
		getLocaleSlug,
	},
};

export class AppsBadge extends PureComponent {
	static propTypes = {
		altText: TranslatableString,
		storeLink: PropTypes.string,
		storeName: PropTypes.oneOf( [ 'ios', 'android' ] ).isRequired,
		titleText: TranslatableString,
		utm_source: PropTypes.string.isRequired,
		utm_campaign: PropTypes.string,
		utm_medium: PropTypes.string,
	};

	static defaultProps = {
		altText: '',
		storeLink: null,
		titleText: '',
	};

	constructor( props ) {
		super( props );

		const localeSlug = APP_STORE_BADGE_URLS[ props.storeName ].getLocaleSlug().toLowerCase();

		const shouldLoadExternalImage = ! startsWith( localeSlug, 'en' );

		this.state = {
			shouldLoadExternalImage,
			imageSrc: shouldLoadExternalImage
				? APP_STORE_BADGE_URLS[ props.storeName ].src.replace( '{localeSlug}', localeSlug )
				: APP_STORE_BADGE_URLS[ props.storeName ].defaultSrc,
		};

		if ( shouldLoadExternalImage ) {
			this.image = null;
			this.loadImage();
		}
	}

	loadImage() {
		this.image = new globalThis.Image();
		this.image.src = this.state.imageSrc;
		this.image.onload = this.onLoadImageComplete;
		this.image.onerror = this.onLoadImageError;
	}

	onLoadImageComplete = () => {
		this.setState( {
			hasExternalImageLoaded: true,
		} );
	};

	onLoadImageError = () => {
		this.setState( {
			hasExternalImageLoaded: false,
			imageSrc: APP_STORE_BADGE_URLS[ this.props.storeName ].defaultSrc,
		} );
	};

	onLinkClick = () => {
		const { storeName } = this.props;
		this.props.recordTracksEvent( APP_STORE_BADGE_URLS[ storeName ].tracksEvent );
	};

	render() {
		const {
			altText,
			titleText,
			storeLink,
			storeName,
			utm_source,
			utm_medium,
			utm_campaign,
		} = this.props;
		const { imageSrc, hasExternalImageLoaded } = this.state;

		const figureClassNames = classNames( 'get-apps__app-badge', {
			[ `${ storeName }-app-badge` ]: true,
			'is-external-image': hasExternalImageLoaded,
		} );

		const badge = APP_STORE_BADGE_URLS[ storeName ];

		return (
			<figure className={ figureClassNames }>
				<a
					href={
						storeLink ? storeLink : badge.getStoreLink( utm_source, utm_medium, utm_campaign )
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
