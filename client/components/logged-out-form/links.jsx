import clsx from 'clsx';
import PropTypes from 'prop-types';

import './links.scss';

export default function LoggedOutFormLinks( { className, ...props } ) {
	return <div className={ clsx( 'logged-out-form__links', className ) } { ...props } />;
}

LoggedOutFormLinks.propTypes = {
	children: PropTypes.node.isRequired,
	className: PropTypes.string,
};
