import clsx from 'clsx';
import PropTypes from 'prop-types';

import './style.scss';

const Masterbar = ( { children, className } ) => (
	<header id="header" className={ clsx( 'masterbar', className ) }>
		{ children }
	</header>
);

Masterbar.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
};

export default Masterbar;
