/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */

class ListRow extends Component {
	render() {
		const { children } = this.props;
		return (
			<tr>
				{ children }
			</tr>
		);
	}

}

export default ListRow;
