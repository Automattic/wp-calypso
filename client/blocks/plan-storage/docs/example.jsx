/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import PlanStorage from '../index';
import PlanStorageBar from '../bar';
import sitesList from 'lib/sites-list';
import {
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
	PLAN_FREE,
} from 'lib/plans/constants';

const sites = sitesList();

export default React.createClass( {

	displayName: 'PlanStorage',

	mixins: [ PureRenderMixin ],

	render() {
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
			<div>
				<div style={ { marginBottom: 16 } }>
					<PlanStorage siteId={ siteId } />
				</div>

				<div style={ { marginBottom: 16 } }>
					<PlanStorageBar
						siteSlug={ primarySite.slug }
						sitePlanSlug={ PLAN_FREE }
						mediaStorage={ mediaStorage.green }
					/>
				</div>
				<div style={ { marginBottom: 16, maxWidth: '400px' } }>
					<PlanStorageBar
						siteSlug={ primarySite.slug }
						sitePlanSlug={ PLAN_PERSONAL }
						mediaStorage={ mediaStorage.yellow }
					/>
				</div>

				<div style={ { marginBottom: 16, maxWidth: '300px' } }>
					<PlanStorageBar
						siteSlug={ primarySite.slug }
						sitePlanSlug={ PLAN_PREMIUM }
						mediaStorage={ mediaStorage.red }
					/>
				</div>

				<div style={ { marginBottom: 16 } }>
					<span style={ { fontSize: 12, color: 'grey' } }>
						Business plans have unlimited storage, so PlanStorage will not be rendered.
					</span>
					<PlanStorageBar
						siteSlug={ primarySite.slug }
						sitePlanSlug={ PLAN_BUSINESS }
						mediaStorage={ mediaStorage.red }
					/>
				</div>
			</div>
		);
	}
} );
