import {
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControl as InputControl,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	Button,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { copySmall } from '@wordpress/icons';
import React, { useState, useEffect } from 'react';

export default function ClipboardInputControl( {
	onCopy,
	...props
}: Omit< React.ComponentProps< typeof InputControl >, 'onCopy' > & {
	onCopy?: ( label?: React.ReactNode ) => void;
} ) {
	const [ isCopied, setCopied ] = useState( false );

	const handleCopy = () => {
		if ( props.value ) {
			navigator.clipboard.writeText( props.value );
			setCopied( true );
			onCopy?.( props.label );
		}
	};

	// toggle the `isCopied` flag back to `false` after 4 seconds
	useEffect( () => {
		if ( isCopied ) {
			const timerId = window.setTimeout( () => setCopied( false ), 4000 );
			return () => window.clearTimeout( timerId );
		}
	}, [ isCopied ] );

	return (
		<InputControl
			{ ...props }
			suffix={
				<InputControlSuffixWrapper variant="control">
					<Button
						size="small"
						icon={ copySmall }
						label={
							isCopied
								? __( 'Copied' )
								: sprintf(
										/* translators: %s is the field to copy */
										__( 'Copy %s' ),
										props.label
								  )
						}
						onClick={ handleCopy }
					/>
				</InputControlSuffixWrapper>
			}
		/>
	);
}
