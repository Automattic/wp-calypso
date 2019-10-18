/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import Button from 'components/button';

/**
 * Style dependencies
 */
import './style.scss';

class HeaderButton extends Component {
	render() {
		const { icon, label, ...rest } = this.props;

		return (
			<Button className="header-button" { ...rest }>
				{ icon && <Gridicon icon={ icon } size={ 18 } /> }
				<span className="header-button__text">{ label }</span>
			</Button>
		);
	}
}

HeaderButton.propTypes = {
	icon: PropTypes.string,
	label: PropTypes.node,
};

export default HeaderButton;
