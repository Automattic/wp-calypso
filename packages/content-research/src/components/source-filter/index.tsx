import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { SourceFilter } from '../../types';

interface SourceFilterProps {
	activeFilter: SourceFilter;
	onFilterChange: ( filter: SourceFilter ) => void;
}

const FILTERS: { value: SourceFilter; label: string }[] = [
	{ value: 'all', label: __( 'All', 'content-research' ) },
	{ value: 'reader', label: __( 'WPCOM', 'content-research' ) },
	{ value: 'hn', label: __( 'HN', 'content-research' ) },
	{ value: 'googlenews', label: __( 'News', 'content-research' ) },
];

export default function SourceFilterTabs( { activeFilter, onFilterChange }: SourceFilterProps ) {
	return (
		<div className="content-research-source-filter">
			<ToggleGroupControl
				label={ __( 'Source', 'content-research' ) }
				value={ activeFilter }
				isBlock
				hideLabelFromVision
				__nextHasNoMarginBottom
				onChange={ ( value ) => onFilterChange( value as SourceFilter ) }
			>
				{ FILTERS.map( ( filter ) => (
					<ToggleGroupControlOption
						key={ filter.value }
						value={ filter.value }
						label={ filter.label }
					/>
				) ) }
			</ToggleGroupControl>
		</div>
	);
}
