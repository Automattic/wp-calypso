/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import SelectDropdown from 'calypso/components/select-dropdown';

const StatsModuleSelectDropdown = ( { initialSelected, options, onSelect = () => {} } ) => {
	return (
		<div className="stats-module__select-dropdown-wrapper">
			<SelectDropdown
				options={ options }
				onSelect={ onSelect }
				initialSelected={ initialSelected }
			/>
		</div>
	);
};

StatsModuleSelectDropdown.propTypes = {
	options: PropTypes.array,
	onSelect: PropTypes.func,
};

export default StatsModuleSelectDropdown;
