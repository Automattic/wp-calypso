import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

export const DomainSearchSubmit = () => {
	const { __ } = useI18n();

	return (
		<Button className="domain-search-controls__submit" variant="primary">
			{ __( 'Search Domains' ) }
		</Button>
	);
};
