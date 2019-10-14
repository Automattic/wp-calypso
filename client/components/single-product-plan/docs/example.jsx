/**
 * External dependencies
 */
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import SingleProductPlan from '../index';

function SingleProductPlanExample() {
	return (
		<Fragment>
			<h3>Single Product Plan - default</h3>
			<SingleProductPlan
				title="Jetpack Scan"
				billingTimeFrame="per year"
				fullPrice={ 25 }
				description={
					<Fragment>
						Automatic scanning and one-click fixes keep your site one step ahead of security
						threats. <a href="/plans">More info</a>
					</Fragment>
				}
			/>

			<h3>Single Product Plan - with a discount</h3>
			<SingleProductPlan
				title="Jetpack Scan"
				billingTimeFrame="per year"
				fullPrice={ 25.99 }
				discountedPrice={ 16.99 }
				description={
					<Fragment>
						Automatic scanning and one-click fixes keep your site one step ahead of security
						threats. <a href="/plans">More info</a>
					</Fragment>
				}
			/>

			<h3>Single Product Plan - with a discounted price range</h3>
			<SingleProductPlan
				title="Jetpack Backup"
				billingTimeFrame="per year"
				fullPriceRange={ [ 16, 25 ] }
				discountedPriceRange={ [ 12, 16 ] }
				description={
					<Fragment>
						Always-on backups ensure you never lose your site. Choose from real-time or daily
						backups. <a href="/plans">Which one do I need?</a>
					</Fragment>
				}
			/>

			<h3>Single Product Plan - already purchased</h3>
			<SingleProductPlan
				title={
					<Fragment>
						Jetpack Backup <strong>Daily</strong>
					</Fragment>
				}
				subtitle="Purchased 2019-09-13"
				description={
					<Fragment>
						<strong>Looking for more?</strong> With Real-time backups:, we save as you edit and
						you’ll get unlimited backup archives
					</Fragment>
				}
				isPurchased
			/>

			<h3>Single Product Plan - part of Jetpack plan</h3>
			<SingleProductPlan
				title={
					<Fragment>
						Jetpack Backup <em>Real-Time</em>
					</Fragment>
				}
				subtitle={
					<span>
						Included in your <a href="/my-plan">Personal Plan</a>
					</span>
				}
				description="Always-on backups ensure you never lose your site. Your changes are saved as you edit and you have unlimited backup archives"
				isPurchased
			/>
		</Fragment>
	);
}

SingleProductPlanExample.displayName = 'SingleProductPlan';

export default SingleProductPlanExample;
