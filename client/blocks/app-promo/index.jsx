import { Card, Button } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { useTranslate, useRtl } from 'i18n-calypso';
import wpToJpImageRtl from 'calypso/assets/images/jetpack/wp-to-jp-rtl.svg';
import wpToJpImage from 'calypso/assets/images/jetpack/wp-to-jp.svg';
import QrCode from 'calypso/blocks/app-promo/qr-code';
import AppsBadge from 'calypso/blocks/get-apps/apps-badge';
import CardHeading from 'calypso/components/card-heading';
import userAgent from 'calypso/lib/user-agent';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import './style.scss';

export const AppPromo = ( {
	title = false,
	iconSize = 29,
	source = 'calypso-customer-home',
	subheader = false,
	className = 'customer-home__card',
	hasQRCode = false,
} ) => {
	const isRtl = useRtl();
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const iconWidth = Math.ceil( ( 49 / 29 ) * iconSize );

	const { isDesktop, isiPad, isiPod, isiPhone, isAndroid, isMobile } = userAgent;
	const isIos = isiPad || isiPod || isiPhone;

	const showIosBadge = ! isAndroid && ! isDesktop && userAgent;
	const showAndroidBadge = ! isIos && ! isDesktop && userAgent;
	const showBadge = ( showIosBadge || showAndroidBadge ) && isMobile;
	if ( title === false ) {
		title = translate( 'Get our mobile app' );
	}

	if ( subheader === false ) {
		subheader = translate( 'Everything you need to build and grow your site from any device.' );
	}

	className = classNames( className, 'app-promo' );

	return (
		<Card className={ className }>
			<img
				className="app-promo__icon"
				src={ isRtl ? wpToJpImageRtl : wpToJpImage }
				width={ iconWidth }
				height={ iconSize }
				alt="WordPress and Jetpack app"
			/>
			<div className="app-promo__title">
				<CardHeading tagName="h2">{ title }</CardHeading>
				<h3 className="app-promo__subheader">{ subheader }</h3>
			</div>

			{ showBadge && (
				<div className="app-promo__app-badges">
					<AppsBadge
						storeName={ showIosBadge ? 'ios' : 'android' }
						utm_source={ source }
					></AppsBadge>
				</div>
			) }
			{ isLoggedIn && ! showBadge && (
				<Button
					className="app-promo__link-button is-link"
					href={ localizeUrl( `https://apps.wordpress.com/get/?campaign=${ source }` ) }
				>
					{ translate( 'Get the Jetpack app' ) }
				</Button>
			) }
			{ hasQRCode && ! showBadge && <QrCode source={ source } size={ 100 } /> }
		</Card>
	);
};

export default AppPromo;
