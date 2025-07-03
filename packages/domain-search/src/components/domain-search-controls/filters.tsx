import { Button } from '@wordpress/components';
import { funnel } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import './filters.scss';

type Props = {
	count?: number;
};

export const DomainSearchControlsFilters = ( { count }: Props ) => {
	const { __ } = useI18n();

	return (
		<div className="domain-search-controls__filters">
			<Button icon={ funnel } variant="secondary" label={ __( 'Filters' ) } showTooltip />
			{ !! count && <div className="domain-search-controls__filters-count">{ count }</div> }
		</div>
	);
};
