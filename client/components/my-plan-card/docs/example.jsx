/**
 * External dependencies
 */
import React, { Fragment, useState } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import MyPlanCard from '../index';
import { PLAN_JETPACK_FREE } from 'lib/plans/constants';

function MyPlanCardExample() {
	const [ isPlaceholder, setIsPlaceholder ] = useState( false );

	return (
		<Fragment>
			<Button compact onClick={ () => setIsPlaceholder( ! isPlaceholder ) }>
				Toggle placeholders
			</Button>

			<hr />

			<Card compact>
				<strong>My Plan</strong>
			</Card>
			<MyPlanCard
				action={ isPlaceholder ? null : <Button href="/plans">Compare Plans</Button> }
				isPlaceholder={ isPlaceholder }
				plan={ PLAN_JETPACK_FREE }
				tagLine="Upgrade your site to access additional features, including spam protection, backups, and priority support."
				title="Jetpack Free"
			/>
			<Card compact>
				<strong>My Products</strong>
			</Card>
			<MyPlanCard
				action={ isPlaceholder ? null : <Button compact>Manage Product</Button> }
				isPlaceholder={ isPlaceholder }
				expiration={ isPlaceholder ? null : 'Expires on November 6, 2019' }
				tagLine="Your data is being securely backed up as you edit."
				title={
					<Fragment>
						Jetpack Backup <em>Real-Time</em>
					</Fragment>
				}
				isExpiring
			/>
			<MyPlanCard
				action={ isPlaceholder ? null : <Button compact>Manage Product</Button> }
				isPlaceholder={ isPlaceholder }
				expiration={ isPlaceholder ? null : 'Set to auto-renew on August 29, 2020' }
				tagLine="Your data is being scanned for malware."
				title="Jetpack Scan"
			/>
		</Fragment>
	);
}

MyPlanCardExample.displayName = 'MyPlanCard';

export default MyPlanCardExample;
