/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import ListItem from './item';
import SidebarNavigation from 'my-sites/sidebar-navigation';

class List extends Component {
	listItems() {
		return this.props.domains.map( ( domain, index ) => (
			<ListItem key={ `${ index }-${ domain.name }` } domain={ domain } />
		) );
	}

	render() {
		const headerText = this.props.translate( 'Domains', { context: 'A navigation label.' } );
		return (
			<Main wideLayout>
				<DocumentHead title={ headerText } />
				<SidebarNavigation />
				<div className="list__items">{ this.listItems() }</div>
			</Main>
		);
	}
}

export default localize( List );
