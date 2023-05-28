import classNames from 'classnames';
import { Component } from 'react';

import './style.scss';

export interface BadgeProps {
	type:
		| 'warning'
		| 'warning-clear'
		| 'success'
		| 'info'
		| 'info-blue'
		| 'info-green'
		| 'info-purple'
		| 'error';
	className?: string;
}

export default class Badge extends Component< BadgeProps > {
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
