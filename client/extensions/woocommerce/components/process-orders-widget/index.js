/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */

class ProcessOrdersWidget extends Component {
	static propTypes = {
		className: PropTypes.string,
	}

	render = () => {
		const { className } = this.props;
		const classes = classNames( 'card', 'process-orders-widget__container', className );

		return (
			<div className={ classes } >
				{ 'TODO Process Orders Widget' }
			</div>
		);
	}
}

export default ProcessOrdersWidget;
