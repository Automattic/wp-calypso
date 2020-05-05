/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export const Item = ( props ) => {
	const { isSelected, onClick, label, icon, href } = props;

	const classes = classNames( 'sub-masterbar-nav__item', { 'is-selected': isSelected } );

	return (
		<a
			href={ href }
			className={ classes }
			onClick={ onClick }
			aria-selected={ isSelected }
			role="menuitem"
		>
			<Gridicon className="sub-masterbar-nav__icon" icon={ icon } size={ 24 } />
			<div className={ 'sub-masterbar-nav__label' }>{ label }</div>
		</a>
	);
};

Item.propTypes = {
	isSelected: PropTypes.bool,
	onClick: PropTypes.func,
	label: PropTypes.string.isRequired,
	icon: PropTypes.string,
	href: PropTypes.string,
};

Item.defaultProps = {
	isSelected: false,
	onClick: noop,
	icon: 'star',
};

export default Item;
