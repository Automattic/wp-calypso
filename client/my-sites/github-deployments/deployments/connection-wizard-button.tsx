import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';

export const ConnectionWizardButton = ( { onClick }: { onClick(): void } ) => {
	const { __ } = useI18n();

	return (
		<Button primary css={ { display: 'flex', alignItems: 'center' } } onClick={ onClick }>
			{ __( 'Connect repository' ) }
		</Button>
	);
};
