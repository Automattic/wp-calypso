/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import { useMobileBreakpoint } from 'lib/viewport/react';

/**
 * Style dependencies
 */
import './style.scss';

function Tooltip( props ) {
	const isMobile = useMobileBreakpoint();

	if ( ! props.showOnMobile && isMobile ) {
		return null;
	}

	const classes = classnames(
		'tooltip',
		`is-${ props.status }`,
		`is-${ props.position }`,
		props.className
	);

	return (
		<Popover
			autoPosition={ props.autoPosition }
			className={ classes }
			context={ props.context }
			id={ props.id }
			isVisible={ props.isVisible }
			position={ props.position }
			showDelay={ props.showDelay }
		>
			{ props.children }
		</Popover>
	);
}

Tooltip.propTypes = {
	autoPosition: PropTypes.bool,
	className: PropTypes.string,
	id: PropTypes.string,
	isVisible: PropTypes.bool,
	position: PropTypes.string,
	status: PropTypes.string,
	showDelay: PropTypes.number,
	showOnMobile: PropTypes.bool,
};

Tooltip.defaultProps = {
	showDelay: 100,
	position: 'top',
	showOnMobile: false,
};

export default Tooltip;
