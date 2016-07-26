/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import SelectDropdown from 'components/select-dropdown';

/**
 * Constants
 */

// Needed so that computed width more or less matches actual width :/
const WIDTH_CORRECTION = 2.5;

const ThemesSelectDropdown = React.createClass( {
	propTypes: {
		tier: React.PropTypes.string.isRequired,
		options: React.PropTypes.array.isRequired,
		onSelect: React.PropTypes.func.isRequired
	},

	getInitialState() {
		return { style: null };
	},

	componentDidMount() {
		// SelectDropdown relies on absolute positioning, which makes it very
		// hard to work with if we want it inlined with other elements. Forcing
		// a width for it seems relatively safe and does the trick.
		this.setState( {
			style: { width: this.getMaxHiddenWidth() }
		} );
	},

	getMaxHiddenWidth() {
		// We want the dropdown's "main" button (the toggler) to be as wide as
		// the longest of its options, so we look at the hidden container of
		// those options.
		const hiddenList = ReactDom.findDOMNode( this ).querySelector( 'ul' );
		const maxWidth = hiddenList.getBoundingClientRect().width;
		return ( maxWidth + WIDTH_CORRECTION ) + 'px';
	},

	render() {
		return <SelectDropdown
				style={ this.state.style }
				initialSelected={ this.props.tier }
				tipTarget="themes-tier-dropdown"
				{ ...this.props } />;
	}
} );

export default ThemesSelectDropdown;
