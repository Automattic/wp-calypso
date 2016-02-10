/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import Masterbar from './masterbar';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Item from './item';

const MasterbarMinimal = ( { url, loggedOut, children } ) => {
	const logoClassNames = classnames(
		'masterbar__item-logo',
		{ 'is-loggedout': loggedOut }
	);

	return(
		<Masterbar>
			<Item url={ url } icon="my-sites" className={ logoClassNames }>
				WordPress<span className="tld">.com</span>
			</Item>
			{ children }
		</Masterbar>
	);
};

MasterbarMinimal.propTypes = {
	url: React.PropTypes.string.isRequired,
	loggedOut: React.PropTypes.bool,
	children: React.PropTypes.node,
};

MasterbarMinimal.defaultProps = {
	loggedOut: false,
};

export default MasterbarMinimal;
