/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';

/**
 * Style dependencies
 */
import './style.scss';

const HeaderButton = ( { icon, label, ...rest } ) => (
	<Button className="header-button" { ...rest }>
		{ icon && <Gridicon icon={ icon } size={ 18 } /> }
		<span className="header-button__text">{ label }</span>
	</Button>
);

HeaderButton.propTypes = {
	icon: PropTypes.string,
	label: PropTypes.node,
};

export default HeaderButton;
