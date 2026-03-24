import { useRtl, useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import wpToJpImageRtl from 'calypso/assets/images/jetpack/wp-to-jp-rtl.svg';
import wpToJpImage from 'calypso/assets/images/jetpack/wp-to-jp.svg';
import QrCode from 'calypso/blocks/app-promo/qr-code';
import AppsBadge from 'calypso/blocks/get-apps/apps-badge';
import userAgent from 'calypso/lib/user-agent';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';

import './style.scss';

const CAMPAIGN = 'calypso-reader-sidebar';

export default function ReaderSidebarAppPromo() {
	const isRtl = useRtl();
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();

	useEffect( () => {
		recordReaderTracksEvent( 'calypso_reader_sidebar_app_promo_impression' );
	}, [ recordReaderTracksEvent ] );

	const { isiPad, isiPod, isiPhone, isAndroid } = userAgent;
	const isMobile = isiPad || isiPod || isiPhone || isAndroid;
	const showIosBadge = isiPad || isiPod || isiPhone;

	return (
		<div className="reader-sidebar-app-promo">
			<img
				className="reader-sidebar-app-promo__icon"
				src={ isRtl ? wpToJpImageRtl : wpToJpImage }
				width={ 50 }
				height={ 30 }
				alt=""
			/>
			<h3 className="reader-sidebar-app-promo__heading">{ translate( 'Jetpack Mobile App' ) }</h3>
			{ isMobile ? (
				<AppsBadge
					storeName={ showIosBadge ? 'ios' : 'android' }
					utm_campaign={ CAMPAIGN }
					utm_source="calypso"
				/>
			) : (
				<>
					<QrCode campaign={ CAMPAIGN } size={ 80 } />
					<p className="reader-sidebar-app-promo__helper">{ translate( 'Scan to download' ) }</p>
				</>
			) }
		</div>
	);
}
