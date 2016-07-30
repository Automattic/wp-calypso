/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';

const ThemesSelectButtons = React.createClass( {
	propTypes: {
		tier: React.PropTypes.string.isRequired,
		options: React.PropTypes.array.isRequired,
		onSelect: React.PropTypes.func.isRequired
	},

	render() {
		return <SegmentedControl
				options={ this.props.options }
				initialSelected={ this.props.tier }
				onSelect={ this.props.onSelect } />;
	},

} );

export default ThemesSelectButtons;
