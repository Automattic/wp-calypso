/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './link-item.scss';

export default function LoggedOutFormLinkItem( props ) {
	return (
		<a { ...props } className={ classnames( 'logged-out-form__link-item', props.className ) }>
			{ props.children }
		</a>
	);
}
LoggedOutFormLinkItem.propTypes = { className: PropTypes.string };
