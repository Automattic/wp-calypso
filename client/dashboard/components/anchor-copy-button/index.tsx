import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check, link } from '@wordpress/icons';
import { useState } from 'react';

/**
 * Copies the current page URL with the given anchor (e.g. #jetpack-forms) to
 * the clipboard, so a setting can be linked directly — by a person or by an
 * MCP server response pointing at the exact control.
 */
export default function AnchorCopyButton( { anchor }: { anchor: string } ) {
	const [ copied, setCopied ] = useState( false );

	const handleCopy = () => {
		const url = `${ window.location.origin }${ window.location.pathname }#${ anchor }`;
		window.navigator.clipboard?.writeText( url );
		setCopied( true );
		setTimeout( () => setCopied( false ), 2000 );
	};

	return (
		<Button
			icon={ copied ? check : link }
			label={ copied ? __( 'Copied' ) : __( 'Copy link to this setting' ) }
			size="small"
			variant="tertiary"
			onClick={ handleCopy }
		/>
	);
}
