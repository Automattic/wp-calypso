/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'calypso/components/gridicon';
import MaterialIcon from 'calypso/components/material-icon';

import './style.scss';

const DomainManagementNavigationItemContents = function ( props ) {
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

export default DomainManagementNavigationItemContents;
