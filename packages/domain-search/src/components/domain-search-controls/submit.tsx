import { Button, ButtonProps } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

export const DomainSearchControlsSubmit = ( props: ButtonProps ) => {
	const { __ } = useI18n();

	return (
		<Button className="domain-search-controls__submit" variant="primary" { ...props }>
			{ __( 'Search Domains' ) }
		</Button>
	);
};
