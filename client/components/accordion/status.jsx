/**
 * External dependencies
 */

import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Gridicon } from '@automattic/components';

/**
 * Internal dependencies
 */
import Tooltip from 'components/tooltip';

/**
 * Mapping of Notice status to Gridicon icon
 *
 * @type {object}
 */
const STATUS_GRIDICON = {
	info: 'info',
	warning: 'notice',
	error: 'notice',
};

export default class AccordionStatus extends PureComponent {
	static propTypes = {
		type: PropTypes.oneOf( [ 'info', 'warning', 'error' ] ),
		text: PropTypes.node,
		url: PropTypes.string,
		position: PropTypes.string,
		onClick: PropTypes.func,
	};

	static defaultProps = {
		type: 'info',
		onClick: () => {},
	};

	state = {
		isTooltipVisible: false,
	};

	showTooltip = () => this.setState( { isTooltipVisible: true } );
	hideTooltip = () => this.setState( { isTooltipVisible: false } );

	tooltipContextRef = React.createRef();

	render() {
		const { type, text, url, position } = this.props;

		return (
			<Fragment>
				<a
					href={ url }
					onClick={ this.props.onClick }
					ref={ this.tooltipContextRef }
					onMouseEnter={ this.showTooltip }
					onMouseLeave={ this.hideTooltip }
					className={ classNames( 'accordion__status', `is-${ type }` ) }
				>
					<Gridicon icon={ STATUS_GRIDICON[ type ] } />
				</a>
				{ text && (
					<Tooltip
						position={ position }
						isVisible={ this.state.isTooltipVisible }
						context={ this.tooltipContextRef.current }
					>
						{ text }
					</Tooltip>
				) }
			</Fragment>
		);
	}
}
