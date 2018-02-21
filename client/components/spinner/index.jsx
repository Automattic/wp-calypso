/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import classNames from 'classnames';

export default class Spinner extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
		size: PropTypes.number,
	};

	static defaultProps = {
		size: 20,
	};

	render() {
		const className = classNames( 'spinner', this.props.className );

		const style = {
			width: this.props.size,
			height: this.props.size,
			fontSize: this.props.size, // allows border-width to be specified in em units
		};

		return (
			<div className={ className }>
				<div className="spinner__outer" style={ style }>
					<div className="spinner__inner" />
				</div>
			</div>
		);
	}
}
