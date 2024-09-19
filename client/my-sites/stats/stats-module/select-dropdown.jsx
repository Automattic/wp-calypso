import { SelectDropdown } from '@automattic/components';
import PropTypes from 'prop-types';

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
