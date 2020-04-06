/**
 * External dependencies
 */
import React from 'react';
import { Button } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useI18n } from '@automattic/react-i18n';

const CloseButton: React.FunctionComponent< Button.ButtonProps > = ( { ...buttonProps } ) => {
	const { __ } = useI18n();
	return (
		<Button label={ __( 'Close dialog' ) } { ...buttonProps }>
			<Icon icon={ close } />
		</Button>
	);
};

export default CloseButton;
