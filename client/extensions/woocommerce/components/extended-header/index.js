/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';

class ExtendedHeader extends Component {
	render() {
		const { label, description, children } = this.props;

		const labelContent = (
			<div>
				<div className="extended-header__header">{ label }</div>
				<div className="extended-header__header-description">{ description }</div>
			</div>
		);

		return (
			<SectionHeader label={ labelContent }>
				{ children }
			</SectionHeader>
		);
	}
}

export default ExtendedHeader;
