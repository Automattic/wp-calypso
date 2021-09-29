import PropTypes from 'prop-types';

import './style.scss';

const Animate = ( { type, children } ) => (
	<div className={ `animate__${ type }` }>{ children }</div>
);

Animate.propTypes = {
	type: PropTypes.oneOf( [ 'appear', 'fade-in' ] ),
};

export default Animate;
