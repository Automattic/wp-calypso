import classnames from 'classnames';
import PropTypes from 'prop-types';

import './link-item.scss';

export default function LoggedOutFormLinkItem( props ) {
	return (
		<a { ...props } className={ classnames( 'logged-out-form__link-item', props.className ) }>
			{ props.children }
		</a>
	);
}
LoggedOutFormLinkItem.propTypes = { className: PropTypes.string };
