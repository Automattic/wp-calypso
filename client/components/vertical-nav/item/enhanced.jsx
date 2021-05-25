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

const Icon = ( { gridicon, materialIcon } ) => {
	if ( gridicon ) {
		return (
			<Gridicon
				// eslint-disable-next-line wpcalypso/jsx-classname-namespace
				className="vertical-nav-item-enhanced__icon"
				icon={ gridicon }
			/>
		);
	}

	return (
		<MaterialIcon
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			className="vertical-nav-item-enhanced__icon"
			icon={ materialIcon }
		/>
	);
};

const VerticalNavItemEnhanced = ( {
	description,
	external,
	gridicon,
	materialIcon,
	path,
	onClick,
	text,
} ) => {
	return (
		<VerticalNavItem
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			className="vertical-nav-item-enhanced"
			external={ external }
			onClick={ onClick }
			path={ path }
		>
			<>
				<Icon gridicon={ gridicon } materialIcon={ materialIcon } />

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
