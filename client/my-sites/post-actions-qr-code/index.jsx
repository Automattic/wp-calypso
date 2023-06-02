import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { QRCodeCanvas } from 'qrcode.react';
import { useCallback, useState, useEffect } from 'react';

PostActionsQRCode.propTypes = {
	siteUrl: PropTypes.string.isRequired,
	showQRCode: PropTypes.bool.isRequired,
};

function PostActionsQRCode( { siteUrl, showQRCode } ) {
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
			<QRCodeCanvas value={ siteUrl } size={ 200 } level="H" />
		</Dialog>
	);
}

export default PostActionsQRCode;
