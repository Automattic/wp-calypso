/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { flow } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import { getCurrentUser } from 'state/current-user/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

import NestedSidebar from 'blocks/nested-sidebar';
import MySitesSidebarContent from './sidebar';
import { setRouteData } from 'blocks/nested-sidebar/docs/access';

export class MySitesSidebar extends Component {
	componentWillMount() {
		// not necessarily the best place for this call to live.
		// I feel like a higher order component might be a better way... unsure.
		setRouteData( 'root', {
			parent: null,
			component: MySitesSidebarContent,
		} );
	}

	focusContent = () => {
		this.props.setLayoutFocus( 'content' );
	};

	getAddNewSiteUrl() {
		return '/jetpack/new/?ref=calypso-selector';
	}

	addNewSite() {
		// I'd argue that this logic / rendering could be bundled in to a new component,
		// allowing us to make this wrapper 'dumb'.
		if ( this.props.currentUser.visible_site_count > 1 ) {
			return null;
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Button
				borderless
				className="my-sites-sidebar__add-new-site"
				href={ this.getAddNewSiteUrl() }
				onClick={ this.focusContent }
			>
				<Gridicon icon="add-outline" /> { this.props.translate( 'Add New Site' ) }
			</Button>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	render() {
		return (
			<Sidebar>
				<NestedSidebar />
				<SidebarFooter>{ this.addNewSite() }</SidebarFooter>
			</Sidebar>
		);
	}
}

export default flow(
	localize,
	connect(
		state => ( {
			currentUser: getCurrentUser( state ),
		} ),
		{
			setLayoutFocus,
		}
	)
)( MySitesSidebar );
