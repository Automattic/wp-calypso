import { useLocalizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';

import './style.scss';

interface QrCodeProps {
	campaign?: string;
	size?: number;
}

export const QrCode = ( { campaign = 'calypso-app-promo', size = 150 }: QrCodeProps ) => {
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	return (
		<div className="app-promo__qr-code">
			<div className="app-promo__qr-code-canvas">
				<AsyncLoad
					require="qrcode.react"
					placeholder={
						<div
							className="app-promo__qr-code-placeholder"
							style={ { width: `${ size }px`, height: `${ size }px` } }
						/>
					}
					value={ localizeUrl( `https://apps.wordpress.com/get?campaign=${ campaign }-qrcode` ) }
					size={ size }
				/>
			</div>
			<p className="get-apps__card-text">
				{ translate(
					'Visit {{a}}wp.com/app{{/a}} from your mobile device, or scan the code to download the Jetpack mobile app.',
					{
						components: {
							a: (
								<a
									className="get-apps__jetpack-branded-link"
									href={ localizeUrl(
										`https://apps.wordpress.com/get?campaign=${ encodeURIComponent(
											campaign
										) }-shortlink`
									) }
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
