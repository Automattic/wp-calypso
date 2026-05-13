import Skeleton from '../components/skeleton';

export const OnThisDayPostSkeleton = () => (
	<div className="on-this-day-post-skeleton">
		<div className="on-this-day-post-skeleton__header">
			<Skeleton height="80px" width="80px" shape="circle" />
			<div className="on-this-day-post-skeleton__header-content">
				<Skeleton height="36px" className="on-this-day-post-skeleton__title" />
				<Skeleton height="36px" width="80%" className="on-this-day-post-skeleton__title" />
				<div className="on-this-day-post-skeleton__header-meta">
					<Skeleton height="24px" width="100px" />
					<Skeleton height="24px" width="100px" />
					<Skeleton height="24px" width="100px" />
				</div>
			</div>
		</div>
		<Skeleton height="400px" className="on-this-day-post-skeleton__img" />
		<div className="on-this-day-post-skeleton__p">
			<Skeleton height="24px" width="100%" />
			<Skeleton height="24px" width="100%" />
			<Skeleton height="24px" width="75%" />
		</div>
		<div className="on-this-day-post-skeleton__p">
			<Skeleton height="24px" width="100%" />
			<Skeleton height="24px" width="100%" />
			<Skeleton height="24px" width="75%" />
		</div>
	</div>
);
