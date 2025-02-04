import clsx from 'clsx';
import PropTypes from 'prop-types';

import './link-item.scss';

export default function LoggedOutFormLinkItem( { className, ...props } ) {
	return <a className={ clsx( 'logged-out-form__link-item', className ) } { ...props } />;
}

LoggedOutFormLinkItem.propTypes = {
	children: PropTypes.node.isRequired,
	className: PropTypes.string,
};
