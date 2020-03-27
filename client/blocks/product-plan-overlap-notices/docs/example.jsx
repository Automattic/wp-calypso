/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import SitesDropdown from 'components/sites-dropdown';
import { JETPACK_PRODUCTS_LIST } from 'lib/products-values/constants';
import { JETPACK_PLANS } from 'lib/plans/constants';
import ProductPlanOverlapNotices from '../';

class ProductPlanOverlapNoticesExample extends Component {
	state = {
		siteId: 0,
	};

	render() {
		return (
			<div style={ { maxWidth: 520, margin: '0 auto' } }>
				<div style={ { maxWidth: 300, margin: '0 auto 10px' } }>
					<SitesDropdown onSiteSelect={ siteId => this.setState( { siteId } ) } />
				</div>

				{ this.state.siteId ? (
					<ProductPlanOverlapNotices
						plans={ JETPACK_PLANS }
						products={ JETPACK_PRODUCTS_LIST }
						siteId={ this.state.siteId }
					/>
				) : (
					<p style={ { textAlign: 'center' } }>
						Please, select a Jetpack site to experience the full demo.
					</p>
				) }
			</div>
		);
	}
}

ProductPlanOverlapNoticesExample.displayName = 'ProductPlanOverlapNotices';

export default ProductPlanOverlapNoticesExample;
