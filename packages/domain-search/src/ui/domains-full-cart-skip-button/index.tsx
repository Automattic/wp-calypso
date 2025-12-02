import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

import './style.scss';

interface Props {
	onSkip: () => void;
	disabled?: boolean;
}

export const DomainsFullCartSkipButton = ( { onSkip, disabled }: Props ) => {
	const { __ } = useI18n();

	return (
		<Button
			disabled={ disabled }
			className="domains-full-cart__skip-button"
			variant="link"
			onClick={ onSkip }
		>
			{ __( 'Choose a domain later' ) }
		</Button>
	);
};
