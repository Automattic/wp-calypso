import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { normalizeButtonProps } from '../../../helpers/normalizeButtonProps';
import { ButtonProps } from '../../../types';

import './style.scss';

export const LinkButton = ( originalProps: ButtonProps ) => {
	const { __ } = useI18n();

	const linkButtonProps = normalizeButtonProps( originalProps, {
		label: __( 'Link', __i18n_text_domain__ ),
		className: 'step-container-v2__link-button',
	} );

	return <Button variant="link" { ...linkButtonProps } />;
};
