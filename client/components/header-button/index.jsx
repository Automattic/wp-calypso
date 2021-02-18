/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

const HeaderButton = React.forwardRef( ( props, ref ) => {
	const { icon, label, ...rest } = props;

	return (
		<Button { ...rest } className="header-button" ref={ ref }>
			{ icon && <Gridicon icon={ icon } size={ 18 } /> }
			<span className="header-button__text">{ label }</span>
		</Button>
	);
} );

HeaderButton.propTypes = {
	icon: PropTypes.string,
	label: PropTypes.node,
};

export default HeaderButton;
