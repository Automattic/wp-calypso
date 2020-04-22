/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useState } from 'react';

/**
 * Internal dependencies
 */
import ActivityTypeSelector from './activity-type-selector';
/**
 * Style dependencies
 */
import './style.scss';

// interface Filter {
// 	group?: string[];
// 	after?: string;
// 	before?: string;
// 	page: number;
// }

interface Props {
	group?: string[];
	onGroupChange?: ( newGroup: string[] ) => void;
	showActivityTypeSelector: boolean;
	showDateRangeSelector: boolean;
}

const FilterBar: FunctionComponent< Props > = ( {
	group,
	onGroupChange,
	showActivityTypeSelector = true,
	showDateRangeSelector = true,
} ) => {
	const translate = useTranslate();
	const [ isActivityTypeSelectorVisible, setIsActivityTypeSelectorVisible ] = useState( false );

	const toggleIsActivityTypeSelectorVisible = () => {
		setIsActivityTypeSelectorVisible( ! isActivityTypeSelectorVisible );
	};

	return (
		<div className="filter-bar">
			<p>{ translate( 'Filter by:' ) }</p>
			{ showActivityTypeSelector && group && onGroupChange && (
				<ActivityTypeSelector
					group={ group }
					onGroupChange={ onGroupChange }
					isVisible={ isActivityTypeSelectorVisible }
					onClick={ toggleIsActivityTypeSelectorVisible }
				/>
			) }
			{ showDateRangeSelector && <div>{ translate( 'Date range' ) }</div> }
		</div>
	);
};

export default FilterBar;
