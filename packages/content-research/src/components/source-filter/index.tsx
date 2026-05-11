import { Button, ButtonGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SourceIcon from '../source-icon';
import type { SourceFilter } from '../../types';

interface SourceFilterProps {
	activeFilter: SourceFilter;
	onFilterChange: ( filter: SourceFilter ) => void;
}

const FILTERS: { value: SourceFilter; label: string; icon?: Exclude< SourceFilter, 'all' > }[] = [
	{ value: 'all', label: __( 'All', 'content-research' ) },
	{ value: 'reader', label: __( 'WordPress.com', 'content-research' ), icon: 'reader' },
	{ value: 'hn', label: __( 'Hacker News', 'content-research' ), icon: 'hn' },
	{ value: 'polymarket', label: __( 'Polymarket', 'content-research' ), icon: 'polymarket' },
	{ value: 'googlenews', label: __( 'Google News', 'content-research' ), icon: 'googlenews' },
];

export default function SourceFilterTabs( { activeFilter, onFilterChange }: SourceFilterProps ) {
	return (
		<div className="content-research-source-filter">
			<ButtonGroup aria-label={ __( 'Source', 'content-research' ) }>
				{ FILTERS.map( ( filter ) => (
					<Button
						key={ filter.value }
						isPressed={ activeFilter === filter.value }
						label={ filter.label }
						variant="secondary"
						onClick={ () => onFilterChange( filter.value ) }
					>
						{ filter.icon ? (
							<SourceIcon source={ filter.icon } label={ filter.label } />
						) : (
							filter.label
						) }
					</Button>
				) ) }
			</ButtonGroup>
		</div>
	);
}
