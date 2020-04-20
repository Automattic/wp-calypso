/**
 * External dependencies
 */
import React from 'react';
import { Button, Path, SVG } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';

const CloseButton: React.FunctionComponent< Button.ButtonProps > = ( { ...buttonProps } ) => {
	const { __ } = useI18n();
	return (
		<Button label={ __( 'Close dialog' ) } { ...buttonProps }>
			<SVG
				width="12"
				height="12"
				viewBox="0 0 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<Path d="M1.40456 1L15 15M1 15L14.5954 1" stroke="#1E1E1E" strokeWidth="1.5" />
			</SVG>
		</Button>
	);
};

export default CloseButton;
