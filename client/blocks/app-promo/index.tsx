import { Card, Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate, useRtl } from 'i18n-calypso';
import wpToJpImageRtl from 'calypso/assets/images/jetpack/wp-to-jp-rtl.svg';
import wpToJpImage from 'calypso/assets/images/jetpack/wp-to-jp.svg';
import QrCode from 'calypso/blocks/app-promo/qr-code';
import AppsBadge from 'calypso/blocks/get-apps/apps-badge';
import CardHeading from 'calypso/components/card-heading';
import userAgent from 'calypso/lib/user-agent';
import './style.scss';

interface AppPromoProps {
	title?: string;
	iconSize?: number;
	campaign: string;
	subheader?: string;
	className?: string;
	hasQRCode?: boolean;
	hasGetAppButton?: boolean;
}

export const AppPromo = ( {
	title = '',
	iconSize = 29,
	campaign = 'calypso-app-promo',
	subheader = '',
	className = '',
	hasQRCode = false,
	hasGetAppButton = true,
}: AppPromoProps ) => {
	const isRtl = useRtl();
	const translate = useTranslate();
	const iconWidth = Math.ceil( ( 49 / 29 ) * iconSize );

	const { isiPad, isiPod, isiPhone, isAndroid } = userAgent;
	const isIos = isiPad || isiPod || isiPhone;

	const showIosBadge = isIos;
	const showAndroidBadge = isAndroid;
	const showBadge = showIosBadge || showAndroidBadge;

	return (
		<Card className={ clsx( 'app-promo', className ) }>
			<img
				className="app-promo__icon"
				src={ isRtl ? wpToJpImageRtl : wpToJpImage }
				width={ iconWidth }
				height={ iconSize }
				alt="WordPress and Jetpack app"
			/>
			<div className="app-promo__title">
				<CardHeading tagName="h2">{ title || translate( 'Get our mobile app' ) }</CardHeading>
				{ ! showBadge && <h3 className="app-promo__subheader">{ subheader }</h3> }
			</div>

			{ showBadge && (
				<div className="app-promo__app-badges">
					{ subheader && <p className="app-promo__app-badges-text">{ subheader }</p> }
					<AppsBadge
						storeName={ showIosBadge ? 'ios' : 'android' }
						utm_campaign={ campaign }
						utm_source="calypso"
					></AppsBadge>
				</div>
			) }
			{ hasQRCode && ! showBadge && <QrCode campaign={ campaign } size={ 100 } /> }
			{ hasGetAppButton && ! showBadge && (
				<Button
					className="app-promo__link-button is-link"
					href={ `/me/get-apps/?campaign=${ encodeURIComponent( campaign ) }` }
				>
					{ translate( 'Get the Jetpack app' ) }
				</Button>
			) }
		</Card>
	);
};

export default AppPromo;
