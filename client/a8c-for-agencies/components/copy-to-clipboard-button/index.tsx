import { useBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { copy, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';

const CopyToClipboardButton = ( {
	textToCopy,
	onClick,
}: {
	textToCopy: string;
	onClick?: () => void;
} ) => {
	const translate = useTranslate();
	const isNarrowView = useBreakpoint( '<960px' );

	const [ copyStatus, setCopyStatus ] = useState( '' );

	const handleCopyStatus = ( status: 'success' | 'error' ) => {
		setCopyStatus( status );
		setTimeout( () => {
			setCopyStatus( '' );
		}, 2000 );
	};

	const copyToClipboard = () => {
		onClick?.();
		navigator.clipboard
			.writeText( textToCopy )
			.then( () => {
				handleCopyStatus( 'success' );
			} )
			.catch( () => {
				handleCopyStatus( 'error' );
			} );
	};
	return (
		<>
			<Button
				icon={ copyStatus === 'success' ? check : copy }
				variant="tertiary"
				onClick={ copyToClipboard }
			>
				{ ! isNarrowView &&
					( copyStatus === 'success' ? translate( 'Copied' ) : translate( 'Copy to clipboard' ) ) }
			</Button>
		</>
	);
};

export default CopyToClipboardButton;
