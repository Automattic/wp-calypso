/** @format */
/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

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
