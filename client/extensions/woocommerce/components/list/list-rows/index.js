/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */

class ListRows extends Component {
	render() {
		const { children } = this.props;
		return (
			<tbody>
				{ children }
			</tbody>
		);
	}

}

export default ListRows;
