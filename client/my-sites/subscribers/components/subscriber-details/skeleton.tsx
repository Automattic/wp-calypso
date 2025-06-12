import { Card } from '@wordpress/components';
import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import './skeleton.scss';

interface SkeletonProps extends HTMLAttributes< HTMLDivElement > {
	shape?: 'circle' | 'rect';
	height?: string;
	width?: string;
}

const Skeleton = ( {
	shape = 'rect',
	height,
	width,
	style,
	className,
	...rest
}: SkeletonProps ) => {
	const classes = clsx(
		'subscriber-details-skeleton__block',
		{
			'subscriber-details-skeleton__block--circle': shape === 'circle',
		},
		className
	);

	const styles = {
		...style,
		...( height && { height } ),
		...( width && { width } ),
	};

	return <div { ...rest } className={ classes } style={ styles } />;
};

export const SubscriberDetailsSkeleton = () => {
	return (
		<Card className="subscriber-details-skeleton">
			<div className="subscriber-details-skeleton__header">
				<Skeleton
					shape="circle"
					width="48px"
					height="48px"
					className="subscriber-details-skeleton__avatar"
				/>
				<div className="subscriber-details-skeleton__title-group">
					<Skeleton width="80%" height="24px" className="subscriber-details-skeleton__email" />
				</div>
			</div>

			<div className="subscriber-details-skeleton__stats">
				<div className="subscriber-details-skeleton__stat">
					<Skeleton width="24px" height="24px" className="subscriber-details-skeleton__stat-icon" />
					<div className="subscriber-details-skeleton__stat-text">
						<Skeleton width="100%" height="16px" />
						<Skeleton width="60%" height="24px" />
					</div>
				</div>
				<div className="subscriber-details-skeleton__stat">
					<Skeleton width="24px" height="24px" className="subscriber-details-skeleton__stat-icon" />
					<div className="subscriber-details-skeleton__stat-text">
						<Skeleton width="100%" height="16px" />
						<Skeleton width="60%" height="24px" />
					</div>
				</div>
				<div className="subscriber-details-skeleton__stat">
					<Skeleton width="24px" height="24px" className="subscriber-details-skeleton__stat-icon" />
					<div className="subscriber-details-skeleton__stat-text">
						<Skeleton width="100%" height="16px" />
						<Skeleton width="60%" height="24px" />
					</div>
				</div>
			</div>

			<div className="subscriber-details-skeleton__content">
				<div className="subscriber-details-skeleton__section">
					<Skeleton width="30%" height="16px" className="subscriber-details-skeleton__label" />
					<Skeleton width="70%" height="24px" className="subscriber-details-skeleton__value" />
				</div>
				<div className="subscriber-details-skeleton__section">
					<Skeleton width="35%" height="16px" className="subscriber-details-skeleton__label" />
					<Skeleton width="80%" height="24px" className="subscriber-details-skeleton__value" />
				</div>
				<div className="subscriber-details-skeleton__section">
					<Skeleton width="25%" height="16px" className="subscriber-details-skeleton__label" />
					<Skeleton width="40%" height="24px" className="subscriber-details-skeleton__value" />
				</div>
				<div className="subscriber-details-skeleton__section">
					<Skeleton width="30%" height="16px" className="subscriber-details-skeleton__label" />
					<Skeleton width="20%" height="24px" className="subscriber-details-skeleton__value" />
				</div>
			</div>

			<div className="subscriber-details-skeleton__footer">
				<Skeleton width="160px" height="36px" className="subscriber-details-skeleton__button" />
			</div>
		</Card>
	);
};
