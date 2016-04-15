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
import PlanStorageBar from '../bar';
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
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/plan-storage">Plan Storage</a>
				</h2>
				<div>
					<PlanStorage siteId={ sites.getPrimary().ID } type="button" />
				</div>
				<div>
					<PlanStorageButton
						sitePlanName={ plans.free }
						mediaStorage={ mediaStorage.green }
					/>
				</div>
				<div>
					<PlanStorageButton
						sitePlanName={ plans.free }
						mediaStorage={ mediaStorage.yellow }
					/>
				</div>
				<div>
					<PlanStorageButton
						sitePlanName={ plans.premium }
						mediaStorage={ mediaStorage.red }
					/>
				</div>
				<br />
				<div>
					<PlanStorage siteId={ sites.getPrimary().ID } type="bar" />
				</div>
				<div>
					<PlanStorageBar
						sitePlanName={ plans.free }
						mediaStorage={ mediaStorage.green }
					/>
				</div>
				<div>
					<PlanStorageBar
						sitePlanName={ plans.free }
						mediaStorage={ mediaStorage.yellow }
					/>
				</div>
				<div>
					<PlanStorageBar
						sitePlanName={ plans.premium }
						mediaStorage={ mediaStorage.red }
					/>
				</div>
			</div>
		);
	}
} );
