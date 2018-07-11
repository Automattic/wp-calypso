/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class Badge extends React.Component {
	static propTypes = {
		type: PropTypes.oneOf( [ 'warning', 'success' ] ).isRequired,
	};

	static defaultProps = {
		type: 'warning',
	};

	render() {
		const { type } = this.props;
		return <div className={ `badge badge--${ type }` }>{ this.props.children }</div>;
	}
}
