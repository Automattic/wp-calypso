import { Button } from '@wordpress/components';
import { funnel } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import './filters.scss';

export const DomainSearchControlsFilters = () => {
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
