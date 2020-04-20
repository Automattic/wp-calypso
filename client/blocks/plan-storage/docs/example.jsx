/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import PlanStorage from '../index';
import PlanStorageBar from '../bar';
import {
	PLAN_ECOMMERCE,
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
	PLAN_FREE,
} from 'lib/plans/constants';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSiteSlug } from 'state/sites/selectors';

const PlanStorageExample = ( { siteId, siteSlug } ) => {
	const mediaStorage = {
		red: {
			storage_used_bytes: 11362335981,
			max_storage_bytes: 13958643712,
		},
		yellow: {
			storage_used_bytes: 1971389988,
			max_storage_bytes: 3221225472,
		},
		green: {
			storage_used_bytes: 167503724,
			max_storage_bytes: 3221225472,
		},
	};

	if ( ! siteSlug ) {
		return null;
	}

	return (
		<div>
			<div style={ { marginBottom: 16 } }>
				<PlanStorage siteId={ siteId } />
			</div>

			<div style={ { marginBottom: 16 } }>
				<PlanStorageBar
					siteSlug={ siteSlug }
					sitePlanSlug={ PLAN_FREE }
					mediaStorage={ mediaStorage.green }
				/>
			</div>
			<div style={ { marginBottom: 16, maxWidth: '400px' } }>
				<PlanStorageBar
					siteSlug={ siteSlug }
					sitePlanSlug={ PLAN_PERSONAL }
					mediaStorage={ mediaStorage.yellow }
				/>
			</div>

			<div style={ { marginBottom: 16, maxWidth: '300px' } }>
				<PlanStorageBar
					siteSlug={ siteSlug }
					sitePlanSlug={ PLAN_PREMIUM }
					mediaStorage={ mediaStorage.red }
				/>
			</div>

			<div style={ { marginBottom: 16 } }>
				<span style={ { fontSize: 12, color: 'grey' } }>
					Business plans have unlimited storage, so PlanStorage will not be rendered.
				</span>
				<PlanStorageBar
					siteSlug={ siteSlug }
					sitePlanSlug={ PLAN_BUSINESS }
					mediaStorage={ mediaStorage.red }
				/>
			</div>

			<div style={ { marginBottom: 16 } }>
				<span style={ { fontSize: 12, color: 'grey' } }>
					Ecommerce plans have unlimited storage, so PlanStorage will not be rendered.
				</span>
				<PlanStorageBar
					siteSlug={ siteSlug }
					sitePlanSlug={ PLAN_ECOMMERCE }
					mediaStorage={ mediaStorage.red }
				/>
			</div>
		</div>
	);
};

const ConnectedPlanStorageExample = connect( ( state ) => {
	const siteId = get( getCurrentUser( state ), 'primary_blog', null );
	const siteSlug = getSiteSlug( state, siteId );

	return {
		siteId,
		siteSlug,
	};
} )( PlanStorageExample );

ConnectedPlanStorageExample.displayName = 'PlanStorage';

export default ConnectedPlanStorageExample;
