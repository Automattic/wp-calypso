import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { normalizeButtonProps } from '../../../helpers/normalizeButtonProps';
import { ButtonProps } from '../../../types';

import './style.scss';

export const SecondaryButton = ( originalProps: ButtonProps ) => {
	const { __ } = useI18n();

	const secondaryButtonProps = normalizeButtonProps( originalProps, {
		children: __( 'Secondary', __i18n_text_domain__ ),
		className: 'step-container-v2__secondary-button',
	} );

	return <Button __next40pxDefaultSize variant="secondary" { ...secondaryButtonProps } />;
};
