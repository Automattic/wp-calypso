import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

export const ConnectionWizardButton = ( { onClick }: { onClick(): void } ) => {
	const { __ } = useI18n();

	return (
		<Button variant="primary" onClick={ onClick }>
			{ __( 'Connect repository' ) }
		</Button>
	);
};
