import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

interface Props {
	onSkip: () => void;
}

export const ChooseDomainLater = ( { onSkip }: Props ) => {
	const { __ } = useI18n();

	return (
		<Button className="choose-domain-later__btn" variant="link" onClick={ onSkip }>
			{ __( 'Choose a domain later' ) }
		</Button>
	);
};
