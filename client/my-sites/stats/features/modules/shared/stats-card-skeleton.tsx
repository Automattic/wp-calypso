import { LoadingPlaceholder, StatsCard } from '@automattic/components';
import clsx from 'clsx';
import React from 'react';

import './stats-card-skeleton.scss';

type StatsCardSkeletonProps = {
	isLoading: boolean;
	className?: string;
	title?: string;
	/**
	 * @property {number} type - Type of card to display. One of three sets with different bar lengths to avoid a monotonous interface.
	 */
	type?: 1 | 2 | 3;
	withHero?: boolean;
	withSplitHeader?: boolean;
	toggleControl?: React.ReactNode;
	metricLabel?: string;
	mainItemLabel?: string;
	titleNodes?: React.ReactNode;
};

const StatsCardSkeleton: React.FC< StatsCardSkeletonProps > = ( {
	isLoading,
	className,
	title,
	type = 1,
	withHero,
	withSplitHeader,
	toggleControl,
	metricLabel,
	mainItemLabel,
	titleNodes,
} ) => {
	// Horizontal Bar placeholders
	const dataTypes = [
		[ 100, 80, 60, 40, 20 ],
		[ 100, 50, 30, 20, 10 ],
		[ 100, 70, 45, 20, 5 ],
	];

	const data = dataTypes[ type ] ?? dataTypes[ 1 ]; // Allow for different types

	return isLoading ? (
		<div
			className={ clsx(
				'stats-card-skeleton',
				{ [ 'stats-card-skeleton--with-hero' ]: withHero },
				className
			) }
		>
			{ /* TODO: Empty title - use another LoadingPlaceholder */ }
			<StatsCard
				title={ title || '' }
				metricLabel={ metricLabel }
				mainItemLabel={ mainItemLabel }
				heroElement={
					withHero ? (
						<LoadingPlaceholder
							className="stats-card-skeleton__placeholder"
							width="100%"
							height="400px"
						/>
					) : null
				}
				splitHeader={ withSplitHeader }
				toggleControl={ toggleControl }
				titleNodes={ titleNodes }
			>
				<ul>
					{ data?.map( ( value, index ) => {
						return (
							<li key={ index }>
								<LoadingPlaceholder
									className="stats-card-skeleton__placeholder"
									width={ `${ value }%` }
									height="36px"
								/>
							</li>
						);
					} ) }
				</ul>
			</StatsCard>
		</div>
	) : null;
};

export default StatsCardSkeleton;
