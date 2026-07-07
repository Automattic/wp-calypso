import clsx from 'clsx';
import PropTypes from 'prop-types';

import './style.scss';

const FullWidthSection = ( { children, className, enabled = false } ) => {
	if ( ! enabled ) {
		return children;
	}

	return (
		<div className={ clsx( 'full-width-section', className ) }>
			<div className="full-width-section__content">{ children }</div>
		</div>
	);
};

FullWidthSection.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	enabled: PropTypes.bool,
};

export default FullWidthSection;
