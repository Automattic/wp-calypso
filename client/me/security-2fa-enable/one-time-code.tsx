import { Button } from '@wordpress/components';
import { check, copy } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import './one-time-code.scss';

type OneTimeCodeProps = {
	oneTimeCode: string;
};

enum CopyStatus {
	COPIED,
	ERROR,
	NEUTRAL,
}

export default function OneTimeCode( { oneTimeCode }: OneTimeCodeProps ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ copyStatus, setCopyStatus ] = useState< CopyStatus >( CopyStatus.NEUTRAL );

	const handleCopyStatus = ( status: CopyStatus ) => {
		setCopyStatus( status );
		setTimeout( () => {
			setCopyStatus( CopyStatus.NEUTRAL );
		}, 2000 );
	};

	const copyToClipboard = () => {
		navigator.clipboard
			.writeText( oneTimeCode )
			.then( () => {
				handleCopyStatus( CopyStatus.COPIED );
				dispatch(
					successNotice( translate( 'One time code copied to clipboard.' ), {
						duration: 2000,
					} )
				);
			} )
			.catch( () => {
				handleCopyStatus( CopyStatus.ERROR );
				dispatch(
					errorNotice( translate( 'There was a problem copying the one time code.' ), {
						duration: 2000,
					} )
				);
			} );
	};

	return (
		<div className="one-time-code">
			<div className="one-time-code__display">
				<div className="one-time-code__content">{ oneTimeCode }</div>
				<Button
					className="one-time-code__copy"
					icon={ CopyStatus.COPIED === copyStatus ? check : copy }
					label={ CopyStatus.COPIED === copyStatus ? translate( 'Copied!' ) : translate( 'Copy' ) }
					onClick={ CopyStatus.NEUTRAL === copyStatus ? copyToClipboard : () => {} }
				/>
			</div>
		</div>
	);
}
