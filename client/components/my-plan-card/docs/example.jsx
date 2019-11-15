/**
 * External dependencies
 */
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import MyPlanCard from '../index';
import { PLAN_JETPACK_PERSONAL } from 'lib/plans/constants';

function MyPlanCardExample() {
	return (
		<Fragment>
			<Card compact>
				<strong>My Plan</strong>
			</Card>
			<MyPlanCard
				buttonLabel="Manage Plan"
				buttonTarget="#"
				expirationDate="2020-10-27T10:37:04+00:00"
				plan={ PLAN_JETPACK_PERSONAL }
				tagLine="Your data is being securely backed up and you have access to priority support."
				title="Jetpack Personal"
			/>
			<Card compact>
				<strong>My Products</strong>
			</Card>
			<MyPlanCard
				buttonLabel="Manage Product"
				buttonTarget="#"
				expirationDate="2020-11-06T06:12:09+00:00"
				tagLine="Your data is being securely backed up as you edit."
				title={
					<Fragment>
						Jetpack Backup <em>Real-Time</em>
					</Fragment>
				}
			/>
			<MyPlanCard
				buttonLabel="Manage Product"
				buttonTarget="#"
				expirationDate="2020-08-29T02:38:13+00:00"
				tagLine="Your data is being scanned for malware."
				title="Jetpack Scan"
			/>
		</Fragment>
	);
}

MyPlanCardExample.displayName = 'MyPlanCard';

export default MyPlanCardExample;
