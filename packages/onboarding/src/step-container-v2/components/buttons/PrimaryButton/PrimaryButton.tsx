import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { normalizeButtonProps } from '../../../helpers/normalizeButtonProps';
import { ButtonProps } from '../../../types';

import './style.scss';

export const PrimaryButton = ( originalProps: ButtonProps ) => {
	const { __ } = useI18n();

	const primaryButtonProps = normalizeButtonProps( originalProps, {
		children: __( 'Next', __i18n_text_domain__ ),
		className: 'step-container-v2__primary-button',
	} );

	return <Button __next40pxDefaultSize variant="primary" { ...primaryButtonProps } />;
};
