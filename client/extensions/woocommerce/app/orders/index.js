/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import Main from 'components/main';
import OrderHeader from './order-header';
import OrdersList from './orders-list';

class Orders extends Component {
	render() {
		const { className, site } = this.props;
		return (
			<Main className={ className }>
				<OrderHeader siteSlug={ site.slug } />
				<OrdersList />
			</Main>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSite( state );

		return {
			site,
		};
	}
)( localize( Orders ) );
