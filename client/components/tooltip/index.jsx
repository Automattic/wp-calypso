/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

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
		position: React.PropTypes.string
	},

	render() {
		if ( viewport.isMobile() ) {
			return null;
		}

		return (
			<Popover
				className="popover tooltip"
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
