/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class extends React.PureComponent {
	static propTypes = {
		className: PropTypes.string,
		isHidden: PropTypes.bool,
	};

	static defaultProps = {
		isHidden: false,
	};

	render() {
		const { children, className, isHidden } = this.props;
		const gridClassName = classNames(
			'tile-grid',
			{
				'is-hidden': isHidden,
			},
			className
		);

		return <div className={ gridClassName }>{ children }</div>;
	}
}
