import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { deleteStoredKeyringConnection } from 'calypso/state/sharing/keyring/actions';
import type { Connection } from 'calypso/sites/marketing/connections/types';

interface Props {
	connection: Connection;
}
const GooglePhotosAutUpgrade = ( props: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { connection } = props;
	const [ isDisconnecting, setIsDisconnecting ] = useState( false );

	return (
		<div className="media-library__connect-message">
			<p>
				<img
					src="/calypso/images/sharing/google-photos-logo-text.svg?v=20241124"
					width="400"
					alt={ translate( 'Google Photos' ) }
				/>
			</p>
			<p>
				{ translate(
					"We've updated our Google Photos service. You will need to disconnect and reconnect to continue accessing your photos."
				) }
			</p>

			<Button
				variant="secondary"
				isBusy={ isDisconnecting }
				onClick={ () => {
					dispatch( deleteStoredKeyringConnection( connection ) );
					setIsDisconnecting( true );
				} }
			>
				{ translate( 'Disconnect from Google Photos' ) }
			</Button>
		</div>
	);
};

export default GooglePhotosAutUpgrade;
