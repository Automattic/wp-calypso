/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */

class ListTd extends Component {

	render() {
		const { children, width } = this.props;
		const percentage = `${ width }%`;
		return (
			<td className="list-td" style={ { width: percentage } }>
				{ children }
			</td>
		);
	}

}

export default ListTd;
