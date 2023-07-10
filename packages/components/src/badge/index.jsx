import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';

import './style.scss';

export default class Badge extends Component {
	static propTypes = {
		type: PropTypes.oneOf( [
			'warning',
			'warning-clear',
			'success',
			'info',
			'info-blue',
			'info-green',
			'info-purple',
			'error',
		] ).isRequired,
	};

	static defaultProps = {
		type: 'warning',
	};

	render() {
		const { className, type } = this.props;
		return (
			<div className={ classNames( `badge badge--${ type }`, className ) }>
				{ this.props.children }
			</div>
		);
	}
}
