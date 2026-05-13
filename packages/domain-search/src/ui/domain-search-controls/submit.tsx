import { Button } from '@wordpress/components';
import { Icon, search } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';

import './submit.scss';

export const DomainSearchControlsSubmit = ( {
	onClick,
	iconOnly = false,
}: {
	onClick?: () => void;
	iconOnly?: boolean;
} ) => {
	const { __ } = useI18n();
	const label = __( 'Search domains' );

	return (
		<Button
			variant="primary"
			type="submit"
			className={ clsx( 'domain-search-controls__submit', {
				'is-icon-only': iconOnly,
			} ) }
			onClick={ onClick }
			aria-label={ iconOnly ? label : undefined }
		>
			{ iconOnly ? <Icon icon={ search } size={ 24 } /> : label }
		</Button>
	);
};
