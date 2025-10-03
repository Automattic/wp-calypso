import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

import './style.scss';

interface Props {
	onSkip: () => void;
}

export const DomainsFullCartSkipButton = ( { onSkip }: Props ) => {
	const { __ } = useI18n();

	return (
		<Button className="domains-full-cart__skip-button" variant="link" onClick={ onSkip }>
			{ __( 'Choose a domain later' ) }
		</Button>
	);
};
