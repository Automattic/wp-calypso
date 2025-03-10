import { useBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { Icon, copy, check, error } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';

import './style.scss';

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
			<Button icon={ copy } variant="tertiary" onClick={ copyToClipboard }>
				{ ! isNarrowView &&
					( copyStatus === 'success'
						? translate( 'Copied to clipboard' )
						: translate( 'Copy to clipboard' ) ) }
			</Button>
			{ copyStatus && (
				<div
					className={ clsx( 'copy-to-clipboard-button__status', {
						'is-success': copyStatus === 'success',
						'is-error': copyStatus === 'error',
					} ) }
				>
					{ copyStatus === 'success' && (
						<>
							<Icon icon={ check } size={ 24 } />
							{ isNarrowView ? translate( 'Copied' ) : translate( 'Copied to clipboard' ) }
						</>
					) }
					{ copyStatus === 'error' && (
						<>
							<Icon icon={ error } size={ 24 } />
							{ isNarrowView ? translate( 'Failed' ) : translate( 'Failed to copy to clipboard' ) }
						</>
					) }
				</div>
			) }
		</>
	);
};

export default CopyToClipboardButton;
