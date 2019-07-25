/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

export default class Spinner extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
		size: PropTypes.number,
		align: PropTypes.oneOf( [ 'right', 'left' ] ),
	};

	static defaultProps = {
		size: 20,
		align: null,
	};

	render() {
		const className = classNames( 'spinner', this.props.align, this.props.className );

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
