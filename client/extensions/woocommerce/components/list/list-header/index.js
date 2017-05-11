/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */

class ListHeader extends Component {

	render() {
		const { children } = this.props;

		return (
			<thead>
				<tr className="list-header__container">
					{ children }
				</tr>
			</thead>
		);
	}

}

export default ListHeader;
