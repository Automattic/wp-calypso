/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import MaterialIcon from 'calypso/components/material-icon';
import VerticalNavItem from 'calypso/components/vertical-nav/item';

/**
 * Style dependencies
 */
import './style.scss';

const VerticalNavItemEnhanced = ( { description, external, gridicon, materialIcon, path, onClick, text, } ) => {
	return (
		<VerticalNavItem
			className="vertical-nav-item-enhanced"
			external={ external }
			onClick={ onClick }
			path={ path }
		>
			<>
				{ gridicon && <Gridicon className="vertical-nav-item-enhanced__icon" icon={ gridicon } /> }

				{ ! gridicon && <MaterialIcon icon={ materialIcon } className="vertical-nav-item-enhanced__icon" /> }

				<div>
					<div>{ text }</div>

					<small>{ description }</small>
				</div>
			</>
		</VerticalNavItem>
	);
};

VerticalNavItemEnhanced.propTypes = {
	description: PropTypes.string.isRequired,
	external: PropTypes.bool,
	gridicon: PropTypes.string,
	materialIcon: PropTypes.string,
	onClick: PropTypes.func,
	path: PropTypes.string,
	text: PropTypes.string.isRequired,
};

export default VerticalNavItemEnhanced;
