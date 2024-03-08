import { SimplifiedSegmentedControl } from '@automattic/components';
import * as React from 'react';

import './style.scss';

export type FilterValue = 'all' | 'fixed' | 'ignored';
export type FilterOption =
	| {
			value: 'all';
			label: 'All';
	  }
	| {
			value: 'fixed';
			label: 'Fixed';
	  }
	| {
			value: 'ignored';
			label: 'Ignored';
	  };

const filterOptions: FilterOption[] = [
	{ value: 'all', label: 'All' },
	{ value: 'fixed', label: 'Fixed' },
	{ value: 'ignored', label: 'Ignored' },
];

interface ThreatStatusFilterProps {
	isPlaceholder?: boolean;
	onSelect?: ( ...args: any[] ) => void;
	initialSelected?: FilterValue;
}

const ThreatStatusFilter: React.FC< ThreatStatusFilterProps > = ( {
	isPlaceholder,
	onSelect,
	initialSelected,
} ) => {
	return isPlaceholder ? (
		<div className="threat-history-list__filters is-placeholder"></div>
	) : (
		<SimplifiedSegmentedControl
			className="threat-history-list__filters"
			options={ filterOptions }
			onSelect={ onSelect }
			initialSelected={ initialSelected }
			primary
		/>
	);
};

export default ThreatStatusFilter;
