/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';

const AddEmailAddressesCardPlaceholder = () => {
	return (
		<VerticalNav className="gsuite-add-users__placeholder">
			<VerticalNavItem isPlaceholder />
			<VerticalNavItem isPlaceholder />
			<VerticalNavItem isPlaceholder />
		</VerticalNav>
	);
};

export default AddEmailAddressesCardPlaceholder;
