/**
 * External dependencies
 */
import { isArray } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Notice from 'components/notice';
import StickyPanel from 'components/sticky-panel';
import config from 'config';
import SidebarNavigation from 'my-sites/sidebar-navigation';

const ActionHeader = ( { children, breadcrumbs } ) => {
	// TODO: Implement proper breadcrumbs component.
	// For v1, we will just pass in a prop from each page.
	let breadcrumbsOutput = breadcrumbs;
	if ( isArray( breadcrumbs ) ) {
		breadcrumbsOutput = breadcrumbs.map( function( crumb, i ) {
			return (
				<span key={ i }>
					{crumb}
					{ breadcrumbs.length - 1 === i ? '' : ( <span className="action-header__breadcrumbs-separator"> / </span> ) }
				</span>
			);
		} );
	}

	const showNonAtomicWarrningNotice = config.isEnabled( 'woocommerce/store-on-non-atomic-sites' );

	return (
		<StickyPanel>
			<SidebarNavigation />
			{ showNonAtomicWarrningNotice && <Notice
				status="is-warning"
				className="action-header__notice"
				isCompact={ true }
				text={ 'Store on non Atomic Jetpack site development mode!' }
				showDismiss={ false } />
			}
			<Card className="action-header__header">
				<span className="action-header__breadcrumbs">{ breadcrumbsOutput }</span>
				<div className="action-header__actions">
					{ children }
				</div>
			</Card>
		</StickyPanel>
	);
};

ActionHeader.propTypes = {
	breadcrumbs: PropTypes.oneOfType( [
		PropTypes.arrayOf( PropTypes.node ),
		PropTypes.node,
	] ),
	children: PropTypes.oneOfType( [
		PropTypes.arrayOf( PropTypes.node ),
		PropTypes.node
	] ),
};

export default ActionHeader;
