import React, { PropTypes } from 'react';

export default React.createClass( {
	displayName: 'ComparisonTableCell',

	render() {

		return (
			<div className="comptarison-table__cell">{ this.props.id }</div>
		);
	}
} );
