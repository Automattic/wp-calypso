/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import PlanStorage from '../index';
import PlanStorageButton from '../button';
import sitesList from 'lib/sites-list';

const sites = sitesList();

export default React.createClass( {

	displayName: 'PlanStorage',

	mixins: [ PureRenderMixin ],

	render() {
		const plans = {
			free: 'Free',
			premium: 'Premium'
		};
		const mediaStorage = {
			red: {
				storage_used_bytes: 11362335981,
				max_storage_bytes: 13958643712
			},
			yellow: {
				storage_used_bytes: 1971389988,
				max_storage_bytes: 3221225472
			},
			green: {
				storage_used_bytes: 167503724,
				max_storage_bytes: 3221225472
			}
		};
		const primarySite = sites.initialized && sites.getPrimary();
		const siteId = primarySite ? primarySite.ID : 0;
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/plan-storage">Plan Storage</a>
				</h2>
				<div style={ { marginBottom: 16 } }>
					<PlanStorage siteId={ siteId } />
				</div>
				<div style={ { marginBottom: 16 } }>
					<PlanStorageButton
						sitePlanName={ plans.free }
						mediaStorage={ mediaStorage.green }
					/>
				</div>
				<div style={ { marginBottom: 16 } }>
					<PlanStorageButton
						sitePlanName={ plans.free }
						mediaStorage={ mediaStorage.yellow }
					/>
				</div>
				<div style={ { marginBottom: 16 } }>
					<PlanStorageButton
						sitePlanName={ plans.premium }
						mediaStorage={ mediaStorage.red }
					/>
				</div>
			</div>
		);
	}
} );
