import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	Button,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { copy, check } from '@wordpress/icons';
import { useState, useCallback } from 'react';

interface ClipboardButtonProps {
	text: string;
	className?: string;
}

export default function ClipboardButton( { text }: ClipboardButtonProps ) {
	const [ copied, setCopied ] = useState( false );

	const handleCopy = useCallback( async () => {
		try {
			await navigator.clipboard.writeText( text );
			setCopied( true );
			setTimeout( () => setCopied( false ), 2000 );
		} catch ( error ) {
			// TODO: handle error somehow?
		}
	}, [ text ] );

	return (
		<HStack justify="flex-start" spacing={ 2 }>
			<Text>{ text }</Text>
			<Button
				variant="tertiary"
				onClick={ handleCopy }
				title={ copied ? __( 'Copied!' ) : __( 'Copy to clipboard' ) }
			>
				<HStack spacing={ 2 } justify="flex-start">
					<Icon icon={ copied ? check : copy } size={ 16 } />
					<span>{ copied ? __( 'Copied' ) : __( 'Copy' ) }</span>
				</HStack>
			</Button>
		</HStack>
	);
}
