/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import SitesDropdown from 'components/sites-dropdown';
import ProductPlanOverlapNotices from '../';

const jetpackPlans = [
	'jetpack_personal',
	'jetpack_personal_monthly',
	'jetpack_premium',
	'jetpack_premium_monthly',
	'jetpack_business',
	'jetpack_business_monthly',
];

const jetpackProducts = [
	'jetpack_backup_daily',
	'jetpack_backup_daily_monthly',
	'jetpack_backup_realtime',
	'jetpack_backup_realtime_monthly',
];

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
						plans={ jetpackPlans }
						products={ jetpackProducts }
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
