/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class Badge extends React.Component {
	static propTypes = {
		type: PropTypes.oneOf( [ 'warning', 'success' ] ),
		size: PropTypes.oneOf( [ 'regular', 'small' ] ),
	};

	static defaultProps = {
		type: 'warning',
		size: 'regular',
	};

	render() {
		const { type, size } = this.props;
		return <div className={ `badge badge--${ type } is-${ size }` }>{ this.props.children }</div>;
	}
}
