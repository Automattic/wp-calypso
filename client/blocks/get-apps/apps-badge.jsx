/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { identity, startsWith } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { getLocaleSlug } from 'lib/i18n-utils';
import { recordTracksEvent } from 'state/analytics/actions';
import TranslatableString from 'components/translatable/proptype';

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
		getLocaleSlug,
	},
};

export class AppsBadge extends PureComponent {
	static propTypes = {
		altText: TranslatableString,
		storeLink: PropTypes.string,
		storeName: PropTypes.oneOf( [ 'ios', 'android' ] ).isRequired,
		titleText: TranslatableString,
		translate: PropTypes.func,
	};

	static defaultProps = {
		altText: '',
		storeLink: null,
		titleText: '',
		translate: identity,
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
		this.image = new Image();
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
		const { altText, titleText, storeLink, storeName } = this.props;
		const { imageSrc, hasExternalImageLoaded } = this.state;

		const figureClassNames = classNames( 'get-apps__app-badge', {
			[ `${ storeName }-app-badge` ]: true,
			'is-external-image': hasExternalImageLoaded,
		} );

		return (
			<figure className={ figureClassNames }>
				<a
					href={ storeLink }
					onClick={ this.onLinkClick }
					target="_blank"
					rel="noopener noreferrer"
				>
					<img src={ imageSrc } title={ titleText } alt={ altText } />
				</a>
			</figure>
		);
	}
}

export default connect( null, {
	recordTracksEvent,
} )( localize( AppsBadge ) );
