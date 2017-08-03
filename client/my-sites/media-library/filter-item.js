/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import SectionNavTabItem from 'components/section-nav/item';

class FilterItem extends Component {
	activate = () => {
		this.props.onChange( this.props.value );
	}

	render() {
		const {
			isDisabled,
			selected,
		} = this.props;

		return (
			<SectionNavTabItem
				selected={ selected }
				onClick={ this.activate }
				disabled={ isDisabled }
			>
				{ this.props.children }
			</SectionNavTabItem>
		);
	}
}

export default FilterItem;
