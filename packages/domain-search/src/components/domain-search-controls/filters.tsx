import { Button } from '@wordpress/components';
import { funnel } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';

export const DomainSearchFilters = () => {
	const { __ } = useI18n();

	return (
		<Button
			className="domain-search-controls__filters"
			icon={ funnel }
			variant="secondary"
			label={ __( 'Filters' ) }
			showTooltip
		/>
	);
};
