import React, { PropTypes } from 'react';

export default React.createClass( {
	displayName: 'ComparisonCell',

	render() {
		return (
			<div>{ this.props.content }</div>
		);
	}
} );
