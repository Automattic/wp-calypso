/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import SelectDropdown from 'components/select-dropdown';

export default React.createClass( {
	displayName: 'StatsModuleSelectDropdown',

	propTypes: {
		options: PropTypes.array,
		onSelect: PropTypes.func
	},

	getDefaultProps() {
		return {
			onSelect: () => {}
		}
	},

	render() {
		const { onSelect, options } = this.props;

		return (
			<div className="stats-module__select-dropdown-wrapper">
				<SelectDropdown options={ options } onSelect={ onSelect } />
			</div>
		);
	}
} );
