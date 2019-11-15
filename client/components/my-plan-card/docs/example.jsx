/**
 * External dependencies
 */
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import MyPlanCard from '../index';
import { PLAN_JETPACK_FREE } from 'lib/plans/constants';

function MyPlanCardExample() {
	return (
		<Fragment>
			<Card compact>
				<strong>My Plan</strong>
			</Card>
			<MyPlanCard
				action={ <Button href="/plans">Compare Plans</Button> }
				plan={ PLAN_JETPACK_FREE }
				tagLine="Upgrade your site to access additional features, including spam protection, backups, and priority support."
				title="Jetpack Free"
			/>
			<Card compact>
				<strong>My Products</strong>
			</Card>
			<MyPlanCard
				action={ <Button compact>Manage Product</Button> }
				expiration="Expires on November 6, 2019"
				tagLine="Your data is being securely backed up as you edit."
				title={
					<Fragment>
						Jetpack Backup <em>Real-Time</em>
					</Fragment>
				}
				isExpiring
			/>
			<MyPlanCard
				action={ <Button compact>Manage Product</Button> }
				expiration="Set to auto-renew on August 29, 2020"
				tagLine="Your data is being scanned for malware."
				title="Jetpack Scan"
			/>
		</Fragment>
	);
}

MyPlanCardExample.displayName = 'MyPlanCard';

export default MyPlanCardExample;
