import { Button } from '@wordpress/components';
import { normalizeButtonProps } from '../../../helpers/normalizeButtonProps';
import { ButtonProps } from '../../../types';

export const NextButton = ( originalProps: ButtonProps ) => {
	const nextButtonProps = normalizeButtonProps( originalProps, {
		label: 'Next',
		className: 'step-container-v2__next-button',
	} );

	return <Button __next40pxDefaultSize variant="primary" { ...nextButtonProps } />;
};
