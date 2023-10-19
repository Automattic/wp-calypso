import { useLocalizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { QRCodeSVG } from 'qrcode.react';

import './style.scss';

export const QrCode = ( { source = 'calypso-customer-home', size = 150 } ) => {
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	return (
		<div className="app-promo__qr-code">
			<QRCodeSVG
				value={ localizeUrl( `https://apps.wordpress.com/get?campaign=${ source }` ) }
				size={ size }
			/>
			<p className="get-apps__card-text">
				{ translate(
					'Visit {{a}}wp.com/app{{/a}} from your mobile device, or scan the code to download the Jetpack mobile app.',
					{
						components: {
							a: (
								<a
									className="get-apps__jetpack-branded-link"
									href={ localizeUrl( `https://apps.wordpress.com/get?campaign=${ encodeURIComponent ( source ) }` ) }
								/>
							),
						},
					}
				) }
			</p>
		</div>
	);
};

export default QrCode;
