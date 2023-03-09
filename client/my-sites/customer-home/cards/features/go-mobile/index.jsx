import { Card, Button } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { useTranslate, useRtl } from 'i18n-calypso';
import wpToJpImageRtl from 'calypso/assets/images/jetpack/wp-to-jp-rtl.svg';
import wpToJpImage from 'calypso/assets/images/jetpack/wp-to-jp.svg';
import AppsBadge from 'calypso/blocks/get-apps/apps-badge';
import CardHeading from 'calypso/components/card-heading';
import userAgent from 'calypso/lib/user-agent';

import './style.scss';

export const GoMobile = () => {
	const isRtl = useRtl();
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	const { isDesktop, isiPad, isiPod, isiPhone, isAndroid } = userAgent;
	const isIos = isiPad || isiPod || isiPhone;

	const showIosBadge = ! isAndroid && ! isDesktop;
	const showAndroidBadge = ! isIos && ! isDesktop;
	const showBadge = showIosBadge || showAndroidBadge;

	return (
		<Card className="go-mobile go-mobile--jetpack customer-home__card">
			<div className="go-mobile__row">
				<img
					className="go-mobile__icon"
					src={ isRtl ? wpToJpImageRtl : wpToJpImage }
					width="49"
					height="29"
					alt="WordPress and Jetpack app"
				/>
				<div className="go-mobile__title">
					<CardHeading tagName="h2">{ translate( 'Get our mobile app' ) }</CardHeading>
					<h3 className="go-mobile__subheader">
						{ translate( 'Everything you need to build and grow your site from any device.' ) }
					</h3>
				</div>
				{ showBadge ? (
					<div className="go-mobile__app-badges">
						<AppsBadge
							storeName={ showIosBadge ? 'ios' : 'android' }
							utm_source="calypso-customer-home"
						></AppsBadge>
					</div>
				) : (
					<Button
						className="go-mobile__email-link-button is-link"
						href={ localizeUrl( 'https://apps.wordpress.com/get/?campaign=calypso-customer-home' ) }
					>
						{ translate( 'Get the Jetpack app' ) }
					</Button>
				) }
			</div>
		</Card>
	);
};

export default GoMobile;
