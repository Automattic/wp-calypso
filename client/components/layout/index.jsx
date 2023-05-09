import classnames from 'classnames';
import PropTypes from 'prop-types';

import './style.scss';

export default function Layout( { children, className } ) {
	const layoutClasses = classnames( 'layout-wrapper', className );

	return <div className={ layoutClasses }>{ children }</div>;
}

Layout.propTypes = {
	className: PropTypes.string,
};
