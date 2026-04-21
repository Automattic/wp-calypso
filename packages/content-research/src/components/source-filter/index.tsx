import { Button, ButtonGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { SourceFilter } from '../../types';

interface SourceFilterProps {
	activeFilter: SourceFilter;
	onFilterChange: ( filter: SourceFilter ) => void;
}

const FILTERS: { value: SourceFilter; label: string }[] = [
	{ value: 'all', label: __( 'All', 'content-research' ) },
	{ value: 'hn', label: __( 'HN', 'content-research' ) },
	{ value: 'polymarket', label: __( 'Polymarket', 'content-research' ) },
	{ value: 'googlenews', label: __( 'News', 'content-research' ) },
	{ value: 'reader', label: __( 'WPcom', 'content-research' ) },
];

export default function SourceFilterTabs( { activeFilter, onFilterChange }: SourceFilterProps ) {
	return (
		<div className="content-research-source-filter">
			<ButtonGroup>
				{ FILTERS.map( ( filter ) => (
					<Button
						key={ filter.value }
						variant={ activeFilter === filter.value ? 'primary' : 'secondary' }
						size="compact"
						onClick={ () => onFilterChange( filter.value ) }
					>
						{ filter.label }
					</Button>
				) ) }
			</ButtonGroup>
		</div>
	);
}
