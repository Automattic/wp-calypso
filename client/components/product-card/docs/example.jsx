/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import ProductCard from '../index';

class ProductCardExample extends Component {
	displayName = 'ProductCard';

	state = {
		checked: false,
	};

	handleProductSelection = () => {
		this.setState( {
			checked: ! this.state.checked,
		} );
	};

	render() {
		return (
			<Fragment>
				<h3>Product Card - default</h3>
				<ProductCard
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

				<h3>Product Card - with a discount</h3>
				<ProductCard
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

				<h3>Product Card - with a discounted price range</h3>
				<ProductCard
					title="Jetpack Backup"
					billingTimeFrame="per year"
					fullPrice={ [ 16, 25 ] }
					discountedPrice={ [ 12, 16 ] }
					description={
						<Fragment>
							Always-on backups ensure you never lose your site. Choose from real-time or daily
							backups. <a href="/plans">Which one do I need?</a>
						</Fragment>
					}
				/>

				<h3>Product Card - already purchased</h3>
				<ProductCard
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

				<h3>Product Card - part of Jetpack plan</h3>
				<ProductCard
					title={
						<Fragment>
							Jetpack Backup <em>Real-Time</em>
						</Fragment>
					}
					subtitle={
						<Fragment>
							Included in your <a href="/my-plan">Personal Plan</a>
						</Fragment>
					}
					description="Always-on backups ensure you never lose your site. Your changes are saved as you edit and you have unlimited backup archives"
					isPurchased
				/>

				<h3>Product Card - with a static checkbox (checked)</h3>
				<ProductCard
					title="Jetpack Scan"
					billingTimeFrame="per year"
					fullPrice={ 25 }
					description={
						'Automatic scanning and one-click fixes keep your site one step ahead of security threats.'
					}
					checked
				/>

				<h3>Product Card - with a static checkbox (unchecked)</h3>
				<ProductCard
					title="Jetpack Scan"
					billingTimeFrame="per year"
					fullPrice={ 25 }
					description={
						'Automatic scanning and one-click fixes keep your site one step ahead of security threats.'
					}
					checked={ false }
				/>

				<h3>Product Card - with a dynamic checkbox</h3>
				<ProductCard
					title="Jetpack Scan"
					billingTimeFrame="per year"
					fullPrice={ 25 }
					description={
						'Automatic scanning and one-click fixes keep your site one step ahead of security threats.'
					}
					checked={ this.state.checked }
					onSelect={ this.handleProductSelection }
				/>
			</Fragment>
		);
	}
}

export default ProductCardExample;
