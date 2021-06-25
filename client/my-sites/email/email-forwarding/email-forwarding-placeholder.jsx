/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';

const EmailForwardingPlaceholder = () => {
	return (
		<VerticalNav className="email-forwarding__placeholder">
			<VerticalNavItem isPlaceholder />
			<VerticalNavItem isPlaceholder />
			<VerticalNavItem isPlaceholder />
		</VerticalNav>
	);
};

export default EmailForwardingPlaceholder;
