import { Badge as BadgeWrapper } from '@automattic/components';
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
		const { className, type, children } = this.props;
		return (
			<BadgeWrapper type={ type } className={ className }>
				{ children }
			</BadgeWrapper>
		);
	}
}
