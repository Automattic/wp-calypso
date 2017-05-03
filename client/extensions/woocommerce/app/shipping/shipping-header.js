/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';

class ShippingHeader extends Component {
	render() {
		const { label, description, children } = this.props;

		const labelContent = (
			<span>
				<div className="shipping__header">{ label }</div>
				<div className="shipping__header-description">{ description }</div>
			</span>
		);

		return (
			<SectionHeader label={ labelContent }>
				{ children }
			</SectionHeader>
		);
	}
}

export default ShippingHeader;
