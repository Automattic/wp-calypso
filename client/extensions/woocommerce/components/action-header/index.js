/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import PropTypes from 'prop-types';
import { isArray } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StickyPanel from 'components/sticky-panel';

const ActionHeader = ( { children, breadcrumbs } ) => {
	// TODO: Implement proper breadcrumbs component.
	// For v1, we will just pass in a prop from each page.
	let breadcrumbsOutput = breadcrumbs;
	if ( isArray( breadcrumbs ) ) {
		breadcrumbsOutput = breadcrumbs.map( function( crumb, i ) {
			return (
				<span key={ i }>
					{ crumb }
					{ breadcrumbs.length - 1 === i ? (
						''
					) : (
						<span className="action-header__breadcrumbs-separator"> / </span>
					) }
				</span>
			);
		} );
	}

	return (
		<StickyPanel>
			<SidebarNavigation />
			<Card className="action-header__header">
				<span className="action-header__breadcrumbs">{ breadcrumbsOutput }</span>
				<div className="action-header__actions">{ children }</div>
			</Card>
		</StickyPanel>
	);
};

ActionHeader.propTypes = {
	breadcrumbs: PropTypes.oneOfType( [ PropTypes.arrayOf( PropTypes.node ), PropTypes.node ] ),
	children: PropTypes.oneOfType( [ PropTypes.arrayOf( PropTypes.node ), PropTypes.node ] ),
};

export default ActionHeader;
