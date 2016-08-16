/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import viewport from 'lib/viewport';

/**
 * Module variables
 */
const noop = () => {};

class Tooltip extends Component {
	static propTypes = {
		autoPosition: PropTypes.bool,
		className: PropTypes.string,
		id: PropTypes.string,
		isVisible: PropTypes.bool,
		position: PropTypes.string,
		status: PropTypes.string,
		showDelay: PropTypes.number,
		showOnMobile: PropTypes.bool
	};

	static defaultProps = {
		showDelay: 100,
		position: 'top',
		showOnMobile: false
	};

	render() {
		if ( ! this.props.showOnMobile && viewport.isMobile() ) {
			return null;
		}

		const classes = classnames(
			'popover',
			'tooltip',
			`is-${ this.props.position }`,
			this.props.className
		);

		return (
			<Popover
				autoPosition= { this.props.autoPosition }
				className={ classes }
				context={ this.props.context }
				id={ this.props.id }
				isVisible={ this.props.isVisible }
				onClose={ noop }
				position={ this.props.position }
				showDelay={ this.props.showDelay }
			>
				{ this.props.children }
			</Popover>
		);
	}
}

export default Tooltip;
