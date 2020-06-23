/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import VerticalNavItem from 'components/vertical-nav/item';
import Gridicon from 'components/gridicon';
import MaterialIcon from 'components/material-icon';

import './style.scss';

export const DomainManagementNavigationItemContents = function ( props ) {
	const { gridicon, materialIcon, text, description } = props;
	return (
		<React.Fragment>
			{ gridicon && <Gridicon className="navigation__icon" icon={ gridicon } /> }
			{ ! gridicon && <MaterialIcon icon={ materialIcon } className="navigation__icon" /> }
			<div>
				<div>{ text }</div>
				<small>{ description }</small>
			</div>
		</React.Fragment>
	);
};

export const DomainManagementNavigationItem = function ( props ) {
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
