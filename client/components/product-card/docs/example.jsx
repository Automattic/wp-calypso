/**
 * External dependencies
 */
import React, { Fragment, useState } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ProductCard from '../index';
import ProductCardOptions from '../options';

function ProductCardExample() {
	const [ selectedProductOption, selectProductOption ] = useState(
		'jetpack_backup_realtime_monthly'
	);
	const [ isPlaceholder, setIsPlaceholder ] = useState( false );

	return (
		<Fragment>
			<Button compact onClick={ () => setIsPlaceholder( ! isPlaceholder ) }>
				Toggle placeholders
			</Button>

			<hr />

			<h3>Product Card - default</h3>
			<ProductCard
				title="Jetpack Scan"
				isPlaceholder={ isPlaceholder }
				billingTimeFrame={ isPlaceholder ? null : 'per year' }
				fullPrice={ isPlaceholder ? null : 25 }
				description={
					<Fragment>
						Automatic scanning and one-click fixes keep your site one step ahead of security
						threats. <a href="/plans">More info</a>
					</Fragment>
				}
			/>

			<h3>Product Card - with a discounted price range and options</h3>
			<ProductCard
				title="Jetpack Backup"
				isPlaceholder={ isPlaceholder }
				billingTimeFrame={ isPlaceholder ? null : 'per year' }
				fullPrice={ isPlaceholder ? null : [ 16, 25 ] }
				discountedPrice={ isPlaceholder ? null : [ 12, 16 ] }
				description={
					<Fragment>
						Always-on backups ensure you never lose your site. Choose from real-time or daily
						backups. <a href="/plans">Which one do I need?</a>
					</Fragment>
				}
			>
				<ProductCardOptions
					billingTimeFrame={ isPlaceholder ? null : 'per year' }
					optionsLabel="Backup options:"
					options={ [
						{
							discountedPrice: isPlaceholder ? null : 12,
							fullPrice: isPlaceholder ? null : 14,
							slug: 'jetpack_backup_daily_monthly',
							title: 'Daily Backups',
						},
						{
							fullPrice: isPlaceholder ? null : 25,
							slug: 'jetpack_backup_realtime_monthly',
							title: 'Real-Time Backups',
						},
					] }
					selectedSlug={ selectedProductOption }
					handleSelect={ slug => selectProductOption( slug ) }
				/>
			</ProductCard>

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
				isPlaceholder={ isPlaceholder }
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
				isPlaceholder={ isPlaceholder }
				isPurchased
			/>
		</Fragment>
	);
}

ProductCardExample.displayName = 'ProductCard';

export default ProductCardExample;
