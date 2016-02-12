/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import viewport from 'lib/viewport';

export default React.createClass( {

	displayName: 'Tooltip',

	getDefaultProps() {
		return {
			position: 'top'
		};
	},

	propTypes: {
		isVisible: React.PropTypes.bool,
		position: React.PropTypes.string,
		status: React.PropTypes.string
	},

	render() {
		if ( viewport.isMobile() ) {
			return null;
		}

		const classes = classnames(
			'popover',
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
