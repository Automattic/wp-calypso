import { useMobileBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Popover from '../popover';

import './style.scss';

function Tooltip( {
	autoPosition,
	className,
	id,
	isVisible,
	position = 'top',
	status,
	showDelay = 100,
	showOnMobile = false,
	hideArrow = false,
	children,
	context,
} ) {
	const isMobile = useMobileBreakpoint();

	if ( ! showOnMobile && isMobile ) {
		return null;
	}

	const classes = clsx( [ 'tooltip', className ], {
		[ `is-${ status }` ]: status,
	} );

	return (
		<Popover
			autoPosition={ autoPosition }
			className={ classes }
			context={ context }
			id={ id }
			isVisible={ isVisible }
			position={ position }
			showDelay={ showDelay }
			hideArrow={ hideArrow }
		>
			{ children }
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
	hideArrow: PropTypes.bool,
	children: PropTypes.node,
	context: PropTypes.any,
};

export default Tooltip;
