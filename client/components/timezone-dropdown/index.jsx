
/**
 * External Dependencies
 */
import React from 'react';
import noop from 'lodash/utility/noop';

/**
 * Internal dependencies
 */
import Dropdown from 'components/select-dropdown';
import i18n from 'lib/mixins/i18n';

export default React.createClass( {
	displayName: 'TimezoneDropdown',

	propTypes: {
		selectedZone: React.PropTypes.string,
		onSelect: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			onSelect: noop
		};
	},

	getTimezoneNames() {
		return i18n.moment.tz.names().map( zone => {
			return ( {
				label: zone,
				value: zone
			} );
		} );
	},

	onSelect( zone ) {
		this.setState( { selectedZone: zone.value } );
		this.props.onSelect( zone.value );
	},

	render() {
		return (
			<Dropdown
				className="timezone-dropdown"
				options={ this.getTimezoneNames() }
				selectedText={ this.props.selectedZone }
				onSelect={ this.onSelect }
			/>
		);
	},
} );
