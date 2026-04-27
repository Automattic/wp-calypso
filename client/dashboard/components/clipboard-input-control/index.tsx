import {
	__experimentalInputControl as InputControl,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	Button,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { copySmall } from '@wordpress/icons';
import page from 'page';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function ClipboardInputControl( {
	onCopy,
	...props
}: Omit< React.ComponentProps< typeof InputControl >, 'onCopy' > & {
	onCopy?: ( label?: React.ReactNode ) => void;
} ) {
	const [ isCopied, setCopied ] = useState( false );
	const dispatch = useDispatch();

	const handleCopy = () => {
		if ( props.value ) {
			console.log( 'clipboard copy', props.value );
			navigator.clipboard.writeText( props.value );
			setCopied( true );
			onCopy?.( props.label );
			page( '/copied' );
			dispatch( { type: 'COPY' } );
		}
	};

	// toggle the `isCopied` flag back to `false` after 4 seconds
	useEffect( () => {
		if ( isCopied ) {
			const timerId = window.setTimeout( () => setCopied( false ), 4000 );
			return () => window.clearTimeout( timerId );
		}
	}, [ isCopied ] );

	const label = props.label
		? sprintf(
				/* translators: %s is the field to copy */
				__( 'Copy %s' ),
				props.label
		  )
		: __( 'Copy' );

	return (
		<>
			<div
				dangerouslySetInnerHTML={ {
					__html: props.value as string,
				} }
			/>
			<span>Click to copy this value to your clipboard</span>
			<InputControl
				{ ...props }
				__next40pxDefaultSize
				suffix={
					<InputControlSuffixWrapper variant="control">
						<Button
							size="small"
							icon={ copySmall }
							label={ isCopied ? __( 'Copied' ) : label }
							onClick={ handleCopy }
						/>
					</InputControlSuffixWrapper>
				}
			/>
		</>
	);
}
