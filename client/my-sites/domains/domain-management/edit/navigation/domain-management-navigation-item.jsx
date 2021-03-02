/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DomainManagementNavigationItemContents from 'calypso/my-sites/domains/domain-management/edit/navigation/domain-management-navigation-item-contents';
import VerticalNavItem from 'calypso/components/vertical-nav/item';

import './style.scss';

const DomainManagementNavigationItem = function ( props ) {
	const { path, onClick, external, gridicon, materialIcon, text, description } = props;

	return (
		<VerticalNavItem
			path={ path }
			onClick={ onClick }
			external={ external }
			className="navigation__nav-item"
		>
			<DomainManagementNavigationItemContents
				materialIcon={ materialIcon }
				gridicon={ gridicon }
				text={ text }
				description={ description }
			/>
		</VerticalNavItem>
	);
};

export default DomainManagementNavigationItem;
