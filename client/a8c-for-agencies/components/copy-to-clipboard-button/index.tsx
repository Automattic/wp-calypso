import { Button } from '@wordpress/components';
import { copy, check } from '@wordpress/icons';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useState } from 'react';

const CopyToClipboardButton = ( {
	textToCopy,
	onClick,
	label,
	iconPosition = 'left',
}: {
	textToCopy: string;
	onClick?: () => void;
	label?: TranslateResult;
	iconPosition?: 'left' | 'right';
} ) => {
	const translate = useTranslate();

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
				iconPosition={ iconPosition }
			>
				{ label ??
					( copyStatus === 'success' ? translate( 'Copied' ) : translate( 'Copy to clipboard' ) ) }
			</Button>
		</>
	);
};

export default CopyToClipboardButton;
