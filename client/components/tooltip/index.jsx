/**
 * External dependencies
 */
import React from 'react';
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

export default React.createClass( {

	displayName: 'Tooltip',

	getDefaultProps() {
		return {
			position: 'top',
			showOnMobile: false
		};
	},

	propTypes: {
		isVisible: React.PropTypes.bool,
		position: React.PropTypes.string,
		status: React.PropTypes.string,
		showOnMobile: React.PropTypes.bool
	},

	render() {
		if ( ! this.props.showOnMobile && viewport.isMobile() ) {
			return null;
		}

		const classes = classnames(
			'popover__container',
			'tooltip',
			`is-${ this.props.status }`
		);

		return (
			<Popover
				className={ classes }
				isVisible={ this.props.isVisible }
				context={ this.props.context }
				onClose={ noop }
				position={ this.props.position }
			>
				{ this.props.children }
			</Popover>
		);
	}
} );
