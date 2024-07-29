import { useMobileBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Popover from '../popover';

import './style.scss';

function Tooltip( props ) {
	const isMobile = useMobileBreakpoint();

	if ( ! props.showOnMobile && isMobile ) {
		return null;
	}

	const classes = clsx( [ 'tooltip', props.className ], {
		[ `is-${ props.status }` ]: props.status,
	} );

	return (
		<Popover
			autoPosition={ props.autoPosition }
			className={ classes }
			context={ props.context }
			id={ props.id }
			isVisible={ props.isVisible }
			position={ props.position }
			showDelay={ props.showDelay }
			hideArrow={ props.hideArrow ?? true }
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

Tooltip.defaultProps = {
	showDelay: 100,
	position: 'top',
	showOnMobile: false,
	hideArrow: false,
};

export default Tooltip;
