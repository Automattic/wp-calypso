import { useMobileBreakpoint } from '@automattic/viewport-react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Popover from '../popover';

import './style.scss';

function Tooltip( { showDelay = 100, position = 'top', hideArrow = false, isVisible, ...props } ) {
	const isMobile = useMobileBreakpoint();

	if ( ! props.showOnMobile && isMobile ) {
		return null;
	}

	const classes = classnames( [ 'tooltip', props.className ], {
		[ `is-${ props.status }` ]: props.status,
	} );

	return (
		<Popover
			autoPosition={ props.autoPosition }
			className={ classes }
			context={ props.context }
			id={ props.id }
			isVisible={ isVisible }
			position={ position }
			showDelay={ showDelay }
			hideArrow={ hideArrow ?? true }
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
	hideArrow: PropTypes.bool,
	children: PropTypes.node,
	context: PropTypes.any,
};

export default Tooltip;
