import { Dialog } from '@automattic/components';
import { Icon } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { QRCodeCanvas } from 'qrcode.react';
import { useCallback, useState, useEffect } from 'react';
import PopoverMenuItem from './item';

const icon = (
	<Icon
		icon={
			<svg className="gridicon needs-offset-y" viewBox="0 0 24 24" width="18" height="18">
				<path d="M1,1h1v1h-1z M2,1h1v1h-1z M3,1h1v1h-1z M4,1h1v1h-1z M5,1h1v1h-1z M6,1h1v1h-1z M7,1h1v1h-1z M9,1h1v1h-1z M11,1h1v1h-1z M12,1h1v1h-1z M13,1h1v1h-1z M15,1h1v1h-1z M16,1h1v1h-1z M17,1h1v1h-1z M18,1h1v1h-1z M19,1h1v1h-1z M20,1h1v1h-1z M21,1h1v1h-1z M1,2h1v1h-1z M7,2h1v1h-1z M12,2h1v1h-1z M13,2h1v1h-1z M15,2h1v1h-1z M21,2h1v1h-1z M1,3h1v1h-1z M3,3h1v1h-1z M4,3h1v1h-1z M5,3h1v1h-1z M7,3h1v1h-1z M9,3h1v1h-1z M10,3h1v1h-1z M11,3h1v1h-1z M15,3h1v1h-1z M17,3h1v1h-1z M18,3h1v1h-1z M19,3h1v1h-1z M21,3h1v1h-1z M1,4h1v1h-1z M3,4h1v1h-1z M4,4h1v1h-1z M5,4h1v1h-1z M7,4h1v1h-1z M9,4h1v1h-1z M12,4h1v1h-1z M15,4h1v1h-1z M17,4h1v1h-1z M18,4h1v1h-1z M19,4h1v1h-1z M21,4h1v1h-1z M1,5h1v1h-1z M3,5h1v1h-1z M4,5h1v1h-1z M5,5h1v1h-1z M7,5h1v1h-1z M10,5h1v1h-1z M11,5h1v1h-1z M13,5h1v1h-1z M15,5h1v1h-1z M17,5h1v1h-1z M18,5h1v1h-1z M19,5h1v1h-1z M21,5h1v1h-1z M1,6h1v1h-1z M7,6h1v1h-1z M9,6h1v1h-1z M11,6h1v1h-1z M12,6h1v1h-1z M15,6h1v1h-1z M21,6h1v1h-1z M1,7h1v1h-1z M2,7h1v1h-1z M3,7h1v1h-1z M4,7h1v1h-1z M5,7h1v1h-1z M6,7h1v1h-1z M7,7h1v1h-1z M9,7h1v1h-1z M11,7h1v1h-1z M13,7h1v1h-1z M15,7h1v1h-1z M16,7h1v1h-1z M17,7h1v1h-1z M18,7h1v1h-1z M19,7h1v1h-1z M20,7h1v1h-1z M21,7h1v1h-1z M9,8h1v1h-1z M10,8h1v1h-1z M11,8h1v1h-1z M12,8h1v1h-1z M13,8h1v1h-1z M2,9h1v1h-1z M4,9h1v1h-1z M6,9h1v1h-1z M7,9h1v1h-1z M8,9h1v1h-1z M9,9h1v1h-1z M12,9h1v1h-1z M13,9h1v1h-1z M14,9h1v1h-1z M15,9h1v1h-1z M16,9h1v1h-1z M18,9h1v1h-1z M19,9h1v1h-1z M21,9h1v1h-1z M3,10h1v1h-1z M4,10h1v1h-1z M6,10h1v1h-1z M8,10h1v1h-1z M9,10h1v1h-1z M10,10h1v1h-1z M11,10h1v1h-1z M13,10h1v1h-1z M14,10h1v1h-1z M17,10h1v1h-1z M19,10h1v1h-1z M20,10h1v1h-1z M21,10h1v1h-1z M4,11h1v1h-1z M5,11h1v1h-1z M6,11h1v1h-1z M7,11h1v1h-1z M8,11h1v1h-1z M9,11h1v1h-1z M11,11h1v1h-1z M13,11h1v1h-1z M16,11h1v1h-1z M18,11h1v1h-1z M21,11h1v1h-1z M2,12h1v1h-1z M10,12h1v1h-1z M13,12h1v1h-1z M15,12h1v1h-1z M18,12h1v1h-1z M2,13h1v1h-1z M3,13h1v1h-1z M4,13h1v1h-1z M7,13h1v1h-1z M9,13h1v1h-1z M13,13h1v1h-1z M14,13h1v1h-1z M16,13h1v1h-1z M17,13h1v1h-1z M18,13h1v1h-1z M20,13h1v1h-1z M21,13h1v1h-1z M9,14h1v1h-1z M11,14h1v1h-1z M16,14h1v1h-1z M18,14h1v1h-1z M20,14h1v1h-1z M1,15h1v1h-1z M2,15h1v1h-1z M3,15h1v1h-1z M4,15h1v1h-1z M5,15h1v1h-1z M6,15h1v1h-1z M7,15h1v1h-1z M9,15h1v1h-1z M10,15h1v1h-1z M11,15h1v1h-1z M14,15h1v1h-1z M15,15h1v1h-1z M16,15h1v1h-1z M17,15h1v1h-1z M18,15h1v1h-1z M20,15h1v1h-1z M1,16h1v1h-1z M7,16h1v1h-1z M9,16h1v1h-1z M13,16h1v1h-1z M14,16h1v1h-1z M16,16h1v1h-1z M17,16h1v1h-1z M1,17h1v1h-1z M3,17h1v1h-1z M4,17h1v1h-1z M5,17h1v1h-1z M7,17h1v1h-1z M10,17h1v1h-1z M12,17h1v1h-1z M13,17h1v1h-1z M14,17h1v1h-1z M15,17h1v1h-1z M20,17h1v1h-1z M1,18h1v1h-1z M3,18h1v1h-1z M4,18h1v1h-1z M5,18h1v1h-1z M7,18h1v1h-1z M9,18h1v1h-1z M11,18h1v1h-1z M12,18h1v1h-1z M17,18h1v1h-1z M18,18h1v1h-1z M20,18h1v1h-1z M21,18h1v1h-1z M1,19h1v1h-1z M3,19h1v1h-1z M4,19h1v1h-1z M5,19h1v1h-1z M7,19h1v1h-1z M11,19h1v1h-1z M13,19h1v1h-1z M16,19h1v1h-1z M17,19h1v1h-1z M19,19h1v1h-1z M21,19h1v1h-1z M1,20h1v1h-1z M7,20h1v1h-1z M9,20h1v1h-1z M11,20h1v1h-1z M14,20h1v1h-1z M15,20h1v1h-1z M16,20h1v1h-1z M17,20h1v1h-1z M1,21h1v1h-1z M2,21h1v1h-1z M3,21h1v1h-1z M4,21h1v1h-1z M5,21h1v1h-1z M6,21h1v1h-1z M7,21h1v1h-1z M10,21h1v1h-1z M11,21h1v1h-1z M12,21h1v1h-1z M13,21h1v1h-1z M17,21h1v1h-1z M19,21h1v1h-1z M20,21h1v1h-1z" />
			</svg>
		}
		size={ 18 }
	/>
);

function QRCodeDialog( { url, showQRCode } ) {
	const translate = useTranslate();

	const buttons = [ { action: 'cancel', label: translate( 'Close' ) } ];

	const [ showQRCodeDialog, setShowQRCodeDialog ] = useState( false );

	useEffect( () => {
		setShowQRCodeDialog( showQRCode );
	}, [ showQRCode ] );

	const onCloseDialog = useCallback( () => {
		setShowQRCodeDialog( false );
	}, [] );

	return (
		<Dialog isVisible={ showQRCodeDialog } buttons={ buttons } onClose={ onCloseDialog }>
			<QRCodeCanvas value={ url } size={ 200 } level="H" />
		</Dialog>
	);
}

export default function PopoverMenuItemQrCode( { url, handleClick, children } ) {
	const [ showQRCode, setShowQRCode ] = useState( false );

	const generateQRCode = () => {
		handleClick();
		setShowQRCode( true );
	};

	return (
		<>
			<PopoverMenuItem onClick={ generateQRCode } icon={ icon }>
				{ children }
			</PopoverMenuItem>
			<QRCodeDialog url={ url } showQRCode={ showQRCode } />
		</>
	);
}
