
/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Dropdown from 'components/select-dropdown';
import i18n from 'lib/mixins/i18n';

const { Component, PropTypes } = React;
const noop = () => {};

class TimezoneDropdown extends Component {
	constructor() {
		super();

		// bound methods
		this.onSelect = this.onSelect.bind( this );
	}

	getTimezoneNames() {
		return i18n.moment.tz.names().map( zone => {
			return ( {
				label: zone,
				value: zone
			} );
		} );
	}

	onSelect( zone ) {
		this.setState( { selectedZone: zone.value } );
		this.props.onSelect( zone.value );
	}

	render() {
		return (
			<Dropdown
				className="timezone-dropdown"
				valueLink={ this.props.valueLink }
				options={ this.getTimezoneNames() }
				selectedText={ this.props.selectedZone }
				onSelect={ this.onSelect }
			/>
		);
	}
};

TimezoneDropdown.defaultProps = {
	onSelect: noop
};

TimezoneDropdown.propTypes = {
	selectedZone: PropTypes.string,
	onSelect: PropTypes.func
}

export default TimezoneDropdown;
