/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import SectionHeader from 'calypso/components/section-header';

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
			<SectionHeader className="extended-header" label={ labelContent }>
				{ children }
			</SectionHeader>
		);
	}
}

export default ExtendedHeader;
